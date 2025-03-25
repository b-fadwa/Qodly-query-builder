import { useDataLoader, useRenderer, useSources } from '@ws-ui/webform-editor';
import cn from 'classnames';
import { FC, useEffect, useRef, useState } from 'react';

import { IQuerybuilderProps } from './Querybuilder.config';
import NewGroup from './parts/NewGroup';
const Querybuilder: FC<IQuerybuilderProps> = ({
  dataAttributes,
  style,
  className,
  classNames = [],
}) => {
  const { connect } = useRenderer();
  const [groups, setGroups] = useState([{ rules: [{}] }]);
  //query properties states
  const [builderQuery, setQuery] = useState<string | null>(null);
  const [properties, setProperties] = useState<any[]>([]);
  const [allProperties, setAllProperties] = useState<any[]>([]); //related + storage
  const labelSelect = useRef<HTMLSelectElement>(null);
  const operator = useRef<HTMLSelectElement>(null);
  //[][]for each rule ..
  const [selectedLabels, setSelectedLabels] = useState<string[][]>([[]]);
  const [selectedRelatedLabels, setSelectedRelatedLabels] = useState<string[][]>([[]]);
  const [relatedAttributes, setRelatedAttributes] = useState<any[][]>([]);
  const [finalLabels, setFinalLabels] = useState<string[][]>([[]]);
  const [selectedOperators, setSelectedOperators] = useState<string[][]>([[]]);
  const [inputValues, setInputValues] = useState<string[][]>([[]]);
  // and , or , except states for each group rules
  const [isAnd, setAnd] = useState<boolean>(false);
  const [isOr, setOr] = useState<boolean>(false);
  const [isExcept, setExcept] = useState<boolean>(false);
  const [isAndActive, setAndActive] = useState<boolean[]>([]);
  const [isOrActive, setOrActive] = useState<boolean[]>([]);
  const [isExceptActive, setExceptActive] = useState<boolean[]>([]);
  //and , or states for each group
  const [isAndGroup, setGroupAnd] = useState<boolean>(false);
  const [isOrGroup, setGroupOr] = useState<boolean>(false);
  const [isAndGroupActive, setAndGroupActive] = useState<boolean[]>([]);
  const [isOrGroupActive, setOrGroupActive] = useState<boolean[]>([]);
  const [groupOperators, setGroupOperators] = useState<string[]>([]);
  //input focus states
  const [focusedInput, setFocusedInput] = useState({ groupIndex: 0, ruleIndex: 0 });
  const inputRefs = useRef<{
    [groupIndex: number]: { [ruleIndex: number]: HTMLInputElement | null };
  }>({});
  //default rules
  const [inputs, setInputs] = useState<any[]>([]);
  const [isNewRule, setIsNewRule] = useState<boolean>(false);

  const {
    sources: { datasource: ds },
  } = useSources();

  const { fetchIndex } = useDataLoader({
    source: ds,
  });

  useEffect(() => {
    if (!ds) return;
    const processedEntities = new Set(); // Set to track processed entities and prevent duplicates
    const formattedProperties = Object.values(ds.dataclass.getAllAttributes()).map((item: any) => ({
      name: item.name,
      kind: item.kind,
      type: item.type,
      isDate: item.type === 'date',
      isImage: item.type === 'image',
      isString: item.type === 'string',
      isNumber: item.type === 'long',
      isBoolean: item.type === 'bool',
      isDuration: item.type === 'duration',
      isRelated: item.kind === 'relatedEntities',
    }));

    const combinedProperties: any[] = [];

    // Recursively process related entities and their attributes
    const processAttributes = (attributes: any[], dataClassName: string, depth: number = 0) => {
      if (depth >= 5) return; // Stop at max depth to prevent infinite recursion
      attributes.forEach((item: any) => {
        const uniquePath = dataClassName + item.name;
        if (
          (item.kind === 'relatedEntities' ||
            (item.kind === 'calculated' && item.behavior === 'relatedEntities')) &&
          depth < 5
        ) {
          const dataType = item.type.replace('Selection', '');
          if (processedEntities.has(uniquePath)) return;
          processedEntities.add(uniquePath);
          // Get related entity attributes
          const relatedEntityAttributes = Object.values(
            (ds.dataclass._private.datastore as any)[dataType].getAllAttributes(),
          );
          // Push the related entity itself
          combinedProperties.push({
            name: uniquePath,
            kind: item.kind,
            type: item.type,
            isRelated: item.kind === 'relatedEntities',
          });
          relatedEntityAttributes.forEach((attr: any) => {
            if (attr.kind === 'storage' && !processedEntities.has(uniquePath + '.' + attr.name)) {
              combinedProperties.push({
                name: uniquePath + '.' + attr.name,
                kind: attr.kind,
                type: attr.type,
                isDate: attr.type === 'date',
                isImage: attr.type === 'image',
                isString: attr.type === 'string',
                isNumber: attr.type === 'long',
                isBoolean: attr.type === 'bool',
                isDuration: attr.type === 'duration',
                isRelated: attr.kind === 'relatedEntities',
              });
              processedEntities.add(uniquePath + '.' + attr.name); // Mark this attribute as processed
            }
          });
          // Recurse on the related entity attributes to find deeper related entities
          processAttributes(relatedEntityAttributes, uniquePath + '.', depth + 1);
        } else if (item.kind === 'storage' && !processedEntities.has(uniquePath)) {
          // Handle non-related entities (storage)
          combinedProperties.push({
            name: uniquePath,
            kind: item.kind,
            type: item.type,
            isDate: item.type === 'date',
            isImage: item.type === 'image',
            isString: item.type === 'string',
            isNumber: item.type === 'long',
            isBoolean: item.type === 'bool',
            isDuration: item.type === 'duration',
            isRelated: item.kind === 'relatedEntities',
          });
          processedEntities.add(uniquePath);
        }
      });
    };
    const topLevelAttributes = Object.values(ds.dataclass.getAllAttributes()).filter(
      (item) =>
        item.kind === 'relatedEntities' ||
        (item.kind === 'calculated' && item.behavior === 'relatedEntities'),
    );
    processAttributes(topLevelAttributes, '');
    setProperties(formattedProperties);
    setAllProperties([...combinedProperties, ...formattedProperties]); // add the processed properties too
    setGroups([{ rules: [{}] }]);
    setSelectedLabels([[]]);
    setSelectedRelatedLabels([[]]);
    setFinalLabels([[]]);
    setSelectedOperators([[]]);
    setInputValues([[]]);
  }, []);

  useEffect(() => {
    // If ds is loaded and allProperties are set
    if (allProperties.length > 0 && dataAttributes && dataAttributes.length > 0) {
      const updatedInputs = dataAttributes.map((entry: any) => {
        const property = allProperties.find((prop) => prop.name === entry.source);

        return {
          source: entry.source,
          type: property.type,
          isString: property.isString,
          isNumber: property.isNumber,
          isBoolean: property.isBoolean,
          isDate: property.isDate,
          isImage: property.isImage,
          isDuration: property.isDuration,
          isRelated: property.isRelated,
        };
      });

      setInputs(updatedInputs);
    }

    if (dataAttributes && dataAttributes.length > 0) {
      setGroups([
        {
          rules: Array(dataAttributes.length).fill({}),
        },
      ]);
    }
  }, [dataAttributes, allProperties]);

  const generateRule = (groupIndex: number) => {
    setGroups((prevGroups) => {
      const updatedGroups = [...prevGroups]; //to return the old groups as well appended with the new rule
      updatedGroups[groupIndex] = {
        //add a new rule to the selected group after creating a copy of it to return old rules too
        ...updatedGroups[groupIndex],
        rules: [...updatedGroups[groupIndex].rules, {}], // Append a new rule to th
      };
      return updatedGroups;
    });
    setIsNewRule(true);
    setSelectedLabels((prevLabels) => [...prevLabels, []]);
    setSelectedOperators((prevOperators) => [...prevOperators, []]);
    setInputValues((prevInputs) => [...prevInputs, []]);
  };

  const generateGroup = () => {
    setGroups([...groups, { rules: [{}] }]); //generate a new group with a first rule
    setSelectedLabels((prevLabels) => [...prevLabels, []]);
    setSelectedOperators((prevOperators) => [...prevOperators, []]);
    setInputValues((prevInputs) => [...prevInputs, []]);
  };

  const updateLabel = (v: string, ruleIndex: number, groupIndex: number) => {
    const updatedLabels = [...selectedLabels];
    updatedLabels[groupIndex][ruleIndex] = v;
    setSelectedLabels(updatedLabels);
    updateFinalLabels(updatedLabels, selectedRelatedLabels);
  };

  const updateRelatedLabel = (v: string, ruleIndex: number, groupIndex: number) => {
    setSelectedRelatedLabels((prev) => {
      const updatedRelatedLabels = [...prev];
      if (!updatedRelatedLabels[groupIndex]) {
        updatedRelatedLabels[groupIndex] = [];
      }
      updatedRelatedLabels[groupIndex][ruleIndex] = v;
      updateFinalLabels(updatedRelatedLabels, selectedRelatedLabels);
      return updatedRelatedLabels;
    });
  };

  //final labels(storage and related by rule)
  const updateFinalLabels = (updatedLabels: string[][], updatedRelatedLabels: string[][]) => {
    const updatedFinalLabels = updatedLabels.map((groupLabels, groupIndex) => {
      return groupLabels.map((label, ruleIndex) => {
        const relatedLabel = updatedRelatedLabels[groupIndex]?.[ruleIndex];
        return relatedLabel ? relatedLabel : label;
      });
    });
    setFinalLabels(updatedFinalLabels);
  };

  const updateOperator = (v: string, ruleIndex: number, groupIndex: number) => {
    const updatedOperators = [...selectedOperators];
    updatedOperators[groupIndex][ruleIndex] = v;
    setSelectedOperators(updatedOperators);
  };

  const updateInput = (v: string, ruleIndex: number, groupIndex: number) => {
    const updatedValues = [...inputValues];
    updatedValues[groupIndex][ruleIndex] = v;
    setInputValues(updatedValues);
    setFocusedInput({ ruleIndex, groupIndex });
  };

  useEffect(() => {
    //fix for the input text issue when loosing focus at each rerender
    if (focusedInput.groupIndex != null && focusedInput.ruleIndex != null && inputRefs?.current) {
      const input = inputRefs.current[focusedInput.groupIndex]?.[focusedInput.ruleIndex];
      Array.isArray(input) ? input[0]?.focus() : input?.focus();
    }
  }, [inputValues]);

  const removeRule = (groupIndex: number, ruleIndex: number) => {
    if (groupIndex == 0 && ruleIndex == 0) {
      window.confirm('Cannot remove the by default rule');
      return;
    }
    setGroups((prevGroups) => {
      return prevGroups.map((group, groupId) => {
        if (groupId === groupIndex) {
          return {
            ...group,
            rules: group.rules.filter((_, ruleId) => ruleId !== ruleIndex),
          };
        }
        return group;
      });
    });
    //update the related fields
    setSelectedLabels((prevLabels) => {
      return prevLabels.map((labelGroup, groupId) => {
        if (groupId === groupIndex) {
          return labelGroup.filter((_, ruleId) => ruleId !== ruleIndex);
        }
        return labelGroup;
      });
    });
    setSelectedOperators((prevOperators) => {
      return prevOperators.map((operatorGroup, groupId) => {
        if (groupId === groupIndex) {
          return operatorGroup.filter((_, ruleId) => ruleId !== ruleIndex);
        }
        return operatorGroup;
      });
    });
    setInputValues((prevInputs) => {
      return prevInputs.map((inputGroup, groupId) => {
        if (groupId === groupIndex) {
          return inputGroup.filter((_, ruleId) => ruleId !== ruleIndex);
        }
        return inputGroup;
      });
    });
  };

  const clearBuilder = () => {
    setGroups([{ rules: [{}] }]);
    //+clear datasources binded to inputs...
    setSelectedLabels([[]]);
    setSelectedRelatedLabels([[]]);
    setFinalLabels([[]]);
    setSelectedOperators([[]]);
    setInputValues([[]]);
    setAnd(false);
    setOr(false);
    setAndActive([]);
    setOrActive([]);
    setExceptActive([]);
    setAndGroupActive([]);
    setOrGroupActive([]);
    setTimeout(() => {
      //fix to query cleaning
      setQuery(' ');
    }, 0);
  };

  const setAndOperator = (index: number) => {
    setOr(isAnd);
    setExcept(isAnd);
    setAnd(!isAnd);
    const updatedAndStates = [...isAndActive];
    updatedAndStates[index] = !updatedAndStates[index];
    setAndActive(updatedAndStates);
    const updatedOrStates = [...isOrActive];
    updatedOrStates[index] = false;
    setOrActive(updatedOrStates);
    const updatedExceptStates = [...isExceptActive];
    updatedExceptStates[index] = false;
    setExceptActive(updatedExceptStates);
  };

  const setOrOperator = (index: number) => {
    setAnd(isOr);
    setExcept(isOr);
    setOr(!isOr);
    const updatedOrStates = [...isOrActive];
    updatedOrStates[index] = !updatedOrStates[index];
    setOrActive(updatedOrStates);
    const updatedAndStates = [...isAndActive];
    updatedAndStates[index] = false;
    setAndActive(updatedAndStates);
    const updatedExceptStates = [...isExceptActive];
    updatedExceptStates[index] = false;
    setExceptActive(updatedExceptStates);
  };

  const setExceptOperator = (index: number) => {
    setAnd(isExcept);
    setOr(isExcept);
    setExcept(!isExcept);
    const updatedExceptStates = [...isExceptActive];
    updatedExceptStates[index] = !updatedExceptStates[index];
    setExceptActive(updatedExceptStates);
    const updatedAndStates = [...isAndActive];
    updatedAndStates[index] = false;
    setAndActive(updatedAndStates);
    const updatedOrStates = [...isOrActive];
    updatedOrStates[index] = false;
    setOrActive(updatedOrStates);
  };

  const setGroupAndOperator = (index: number) => {
    setGroupOr(isAndGroup);
    setGroupAnd(!isAndGroup);
    const updatedAndStates = [...isAndGroupActive];
    updatedAndStates[index] = !updatedAndStates[index];
    setAndGroupActive(updatedAndStates);
    const updatedOrStates = [...isOrGroupActive];
    updatedOrStates[index] = false;
    setOrGroupActive(updatedOrStates);
    handleGroupOperatorChange(index - 1, 'AND');
  };

  const setGroupOrOperator = (index: number) => {
    setGroupAnd(isOrGroup);
    setGroupOr(!isOrGroup);
    const updatedOrStates = [...isOrGroupActive];
    updatedOrStates[index] = !updatedOrStates[index];
    setOrGroupActive(updatedOrStates);
    const updatedAndStates = [...isAndGroupActive];
    updatedAndStates[index] = false;
    setAndGroupActive(updatedAndStates);
    handleGroupOperatorChange(index - 1, 'OR');
  };

  const handleGroupOperatorChange = (index: number, operator: string) => {
    setGroupOperators((prev) => {
      const updated = [...prev];
      updated[index] = operator;
      return updated;
    });
  };

  const formQuery = () => {
    let formedQuery: string = '';
    groups.forEach((group, groupIndex) => {
      const groupQueries = group.rules.map((_, ruleIndex) => {
        const operator =
          selectedOperators[groupIndex][ruleIndex] === 'between'
            ? ''
            : selectedOperators[groupIndex][ruleIndex] == 'contains' ||
                selectedOperators[groupIndex][ruleIndex] == 'end'
              ? '='
              : selectedOperators[groupIndex][ruleIndex] || '';
        let value =
          selectedOperators[groupIndex][ruleIndex] === 'between'
            ? ''
            : selectedOperators[groupIndex][ruleIndex] === 'is null' ||
                selectedOperators[groupIndex][ruleIndex] === 'is not null'
              ? ''
              : selectedOperators[groupIndex][ruleIndex] === 'contains'
                ? `"@${inputValues[groupIndex][ruleIndex]}@"`
                : selectedOperators[groupIndex][ruleIndex] === 'end'
                  ? `"@${inputValues[groupIndex][ruleIndex]}"`
                  : `"${inputValues[groupIndex][ruleIndex]}"` || '';
        // between case ->2 inputs
        if (
          selectedOperators[groupIndex][ruleIndex] === 'between' &&
          Array.isArray(inputValues[groupIndex][ruleIndex]) &&
          inputValues[groupIndex][ruleIndex].length === 2
        ) {
          const [start, end] = inputValues[groupIndex][ruleIndex];
          value = '<=' + start + ' AND ' + finalLabels[groupIndex][ruleIndex] + '>=' + end + '';
        }
        return {
          label: finalLabels[groupIndex][ruleIndex] || '',
          operator,
          value,
        };
      });

      groupQueries.forEach((queryPart, queryIndex) => {
        formedQuery += queryPart.label + ' ' + queryPart.operator + ' ' + queryPart.value;
        if (queryIndex < groupQueries.length - 1) {
          if (isAndActive[groupIndex]) {
            formedQuery += ' and ';
          }
          if (isOrActive[groupIndex]) {
            formedQuery += ' or ';
          }
          if (isExceptActive[groupIndex]) {
            formedQuery += ' Except ';
          }
        }
      });
      if (groupIndex < groups.length - 1) {
        formedQuery +=
          groupOperators[groupIndex] === '' ? ' And ' : ' ' + groupOperators[groupIndex] + ' ';
      }
    });
    setQuery(formedQuery);
  };

  useEffect(() => {
    if (!builderQuery) return;
    const queryString =
      builderQuery === ' ' || builderQuery?.includes('undefined') ? '' : builderQuery;
    const fetchData = async () => {
      const { entitysel } = ds as any;
      const dataSetName = entitysel?.getServerRef();
      (ds as any).entitysel = ds.dataclass.query(queryString, {
        dataSetName,
        filterAttributes: ds.filterAttributesText || entitysel._private.filterAttributes,
      });
      await fetchIndex(0);
      ds.fireEvent('changed');
    };
    fetchData();
  }, [builderQuery]);

  return (
    <div ref={connect} style={style} className={cn(className, classNames)}>
      <div
        className={cn('builder', 'flex flex-col h-full gap-4 bg-gray-800 rounded-lg p-2 min-w-fit')}
      >
        <div className={cn('builder-body', 'flex flex-col grow gap-2 p-2')}>
          {groups.map(({}, index) => (
            <div key={index}>
              <NewGroup
                defaultInputs={inputs}
                isNewRule={isNewRule}
                groups={groups}
                index={index}
                isAndGroupActive={isAndGroupActive}
                setGroupAndOperator={setGroupAndOperator}
                isOrGroupActive={isOrGroupActive}
                setGroupOrOperator={setGroupOrOperator}
                isAndActive={isAndActive}
                setAndOperator={setAndOperator}
                isOrActive={isOrActive}
                setOrOperator={setOrOperator}
                isExceptActive={isExceptActive}
                setExceptOperator={setExceptOperator}
                generateRule={generateRule}
                generateGroup={generateGroup}
                removeRule={removeRule}
                labelSelect={labelSelect}
                operator={operator}
                updateLabel={updateLabel}
                properties={properties}
                selectedOperators={selectedOperators}
                updateOperator={updateOperator}
                inputRefs={inputRefs}
                inputValues={inputValues}
                updateInput={updateInput}
                allProperties={allProperties}
                selectedRelatedLabels={selectedRelatedLabels}
                selectedLabels={selectedLabels}
                setRelatedAttributes={setRelatedAttributes}
                updateRelatedLabel={updateRelatedLabel}
                relatedAttributes={relatedAttributes}
              />
            </div>
          ))}
        </div>
        <div
          className={cn('builder-footer', 'w-full flex flex-row justify-end')}
          onClick={() => formQuery()}
        >
          <div className="flex gap-1 h-10 w-1/6">
            <button
              className={cn(
                'builder-clear',
                'rounded-md border-2 border-purple-400 bg-white w-1/2',
              )}
              onClick={() => clearBuilder()}
            >
              Clear
            </button>
            <button className={cn('builder-apply', 'rounded-md bg-purple-400 w-1/2')}>Apply</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Querybuilder;
