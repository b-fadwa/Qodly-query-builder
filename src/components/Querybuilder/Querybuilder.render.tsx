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
  const [isAndGroupActive, setAndGroupActive] = useState<boolean[]>([]);
  const [isOrGroupActive, setOrGroupActive] = useState<boolean[]>([]);
  const [groupOperators, setGroupOperators] = useState<string[]>([]);
  const inputRefs = useRef<{
    [groupIndex: number]: { [ruleIndex: number]: HTMLInputElement | null };
  }>({});
  //default rules
  const [inputs, setInputs] = useState<any[]>([]);
  const [isCleared, setIsCleared] = useState<boolean>(false);

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
      const updatedInputs: any[] = [];
      dataAttributes.forEach((entry: any) => {
        if (!entry.source) {
          // nothing's written
          console.error('Empty source in properties !');
          return;
        }

        const property = allProperties.find((prop) => prop.name === entry.source);
        if (!property) {
          // Property not found
          console.error('Property not found in the dataclass !');
          return;
        }

        updatedInputs.push({
          source: entry.source,
          type: property.type,
          isString: property.isString,
          isNumber: property.isNumber,
          isBoolean: property.isBoolean,
          isDate: property.isDate,
          isImage: property.isImage,
          isDuration: property.isDuration,
          isRelated: property.isRelated,
        });
      });

      setInputs(updatedInputs);

      if (updatedInputs.length > 0) {
        setGroups([
          {
            rules: Array(updatedInputs.length).fill({}),
          },
        ]);
      }
    }
  }, [dataAttributes, allProperties]);

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
    setExcept(false);
    setAndActive([]);
    setOrActive([]);
    setExceptActive([]);
    setAndGroupActive([]);
    setOrGroupActive([]);
    setTimeout(() => {
      //fix to query cleaning
      setQuery(' ');
    }, 0);
    setIsCleared(true);
    setInputs([]);
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
              : selectedOperators[groupIndex][ruleIndex] === 'is true' ||
                  selectedOperators[groupIndex][ruleIndex] === 'is false'
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
      if (
        groups[groupIndex].rules.length > 1 &&
        !isAndActive[groupIndex] &&
        !isExceptActive[groupIndex] &&
        !isOrActive[groupIndex]
      ) {
        console.error("Select an operator for the group's rules");
        return;
      }
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
          groupOperators[groupIndex] === '' || groupOperators[groupIndex] === undefined
            ? ' and '
            : ' ' + groupOperators[groupIndex] + ' ';
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
                setGroups={setGroups}
                setSelectedLabels={setSelectedLabels}
                groups={groups}
                defaultInputs={inputs}
                setInputs={setInputs}
                index={index}
                setGroupOperators={setGroupOperators}
                setAndActive={setAndActive}
                isAndActive={isAndActive}
                setOrActive={setOrActive}
                isOrActive={isOrActive}
                setExceptActive={setExceptActive}
                isExceptActive={isExceptActive}
                setAnd={setAnd}
                isAnd={isAnd}
                setOr={setOr}
                isOr={isOr}
                setExcept={setExcept}
                isExcept={isExcept}
                setAndGroupActive={setAndGroupActive}
                isAndGroupActive={isAndGroupActive}
                setOrGroupActive={setOrGroupActive}
                isOrGroupActive={isOrGroupActive}
                labelSelect={labelSelect}
                operator={operator}
                properties={properties}
                setSelectedOperators={setSelectedOperators}
                selectedOperators={selectedOperators}
                inputRefs={inputRefs}
                setInputValues={setInputValues}
                inputValues={inputValues}
                allProperties={allProperties}
                selectedRelatedLabels={selectedRelatedLabels}
                selectedLabels={selectedLabels}
                setSelectedRelatedLabels={setSelectedRelatedLabels}
                setRelatedAttributes={setRelatedAttributes}
                setFinalLabels={setFinalLabels}
                relatedAttributes={relatedAttributes}
                isCleared={isCleared}
                setIsCleared={setIsCleared}
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
