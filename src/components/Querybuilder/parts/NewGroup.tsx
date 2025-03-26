import { FC, useState } from 'react';
import cn from 'classnames';
import NewRule from './NewRule';
import { FaRegTrashAlt } from 'react-icons/fa';

interface IQueryGroupProps {
  setGroups: (v: any) => void;
  groups: any;
  setGroupOperators: (v: any) => void;
  defaultInputs: any;
  setInputs: (v: any) => void;
  index: any;
  setAnd: (v: boolean) => void;
  isAnd: boolean;
  setOr: (v: boolean) => void;
  isOr: boolean;
  setExcept: (v: boolean) => void;
  isExcept: boolean;
  setExceptActive: (v: any) => void;
  isExceptActive: any;
  setAndActive: (v: any) => void;
  isAndActive: any;
  setOrActive: (v: any) => void;
  isOrActive: any;
  setAndGroupActive: (v: any) => void;
  isAndGroupActive: any;
  setOrGroupActive: (v: any) => void;
  isOrGroupActive: any;
  //rule related props:
  labelSelect: any;
  operator: any;
  properties: any;
  setSelectedOperators: (v: any) => void;
  selectedOperators: any;
  inputRefs: any;
  setInputValues: (v: any) => void;
  inputValues: any;
  allProperties: any;
  setSelectedRelatedLabels: (v: any) => void;
  selectedRelatedLabels: any;
  setSelectedLabels: (v: any) => void;
  selectedLabels: any;
  setRelatedAttributes: (att: any) => void;
  setFinalLabels: (v: any) => void;
  relatedAttributes: any;
  isCleared: boolean;
  setIsCleared: (v: boolean) => void;
}
const NewGroup: FC<IQueryGroupProps> = ({
  setGroups,
  setSelectedLabels,
  setGroupOperators,
  defaultInputs,
  setInputs,
  groups,
  setAndActive,
  isAndActive,
  setExceptActive,
  isExceptActive,
  setOrActive,
  isOrActive,
  setAndGroupActive,
  isAndGroupActive,
  setOrGroupActive,
  isOrGroupActive,
  //rule related props
  labelSelect,
  operator,
  properties,
  index,
  setSelectedOperators,
  selectedOperators,
  inputRefs,
  setInputValues,
  inputValues,
  allProperties,
  setSelectedRelatedLabels,
  selectedRelatedLabels,
  selectedLabels,
  setRelatedAttributes,
  setFinalLabels,
  relatedAttributes,
  isCleared,
  setIsCleared,
}) => {
  const [isAndGroup, setGroupAnd] = useState<boolean>(false);
  const [isOrGroup, setGroupOr] = useState<boolean>(false);
  const [isAnd, setAnd] = useState<boolean>(false);
  const [isOr, setOr] = useState<boolean>(false);
  const [isExcept, setExcept] = useState<boolean>(false);
  const [isNewRule, setIsNewRule] = useState<boolean>(false);

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
    setGroupOperators((prev: any) => {
      const updated = [...prev];
      updated[index] = operator;
      return updated;
    });
  };

  const removeRule = (groupIndex: number, ruleIndex: number) => {
    if (groupIndex == 0 && ruleIndex == 0) {
      window.confirm('Cannot remove the by default rule');
      return;
    }
    setInputs((prev: any) => prev.filter((_: any, idx: any) => idx !== ruleIndex));
    setGroups((prevGroups: any) => {
      return prevGroups.map((group: any, groupId: any) => {
        if (groupId === groupIndex) {
          return {
            ...group,
            rules: group.rules.filter((_: any, ruleId: any) => ruleId !== ruleIndex),
          };
        }
        return group;
      });
    });
    //update the related fields
    setSelectedLabels((prevLabels: any) => {
      return prevLabels.map((labelGroup: any, groupId: any) => {
        if (groupId === groupIndex) {
          return labelGroup.filter((_: any, ruleId: any) => ruleId !== ruleIndex);
        }
        return labelGroup;
      });
    });
    setSelectedOperators((prevOperators: any) => {
      return prevOperators.map((operatorGroup: any, groupId: any) => {
        if (groupId === groupIndex) {
          return operatorGroup.filter((_: any, ruleId: any) => ruleId !== ruleIndex);
        }
        return operatorGroup;
      });
    });
    setInputValues((prevInputs: any) => {
      return prevInputs.map((inputGroup: any, groupId: any) => {
        if (groupId === groupIndex) {
          return inputGroup.filter((_: any, ruleId: any) => ruleId !== ruleIndex);
        }
        return inputGroup;
      });
    });
  };

  const updateOperator = (v: string, ruleIndex: number, groupIndex: number) => {
    const updatedOperators = [...selectedOperators];
    updatedOperators[groupIndex][ruleIndex] = v;
    setSelectedOperators(updatedOperators);
  };

  const generateGroup = () => {
    setGroups([...groups, { rules: [{}] }]); //generate a new group with a first rule
    setSelectedLabels((prevLabels: any) => [...prevLabels, []]);
    setSelectedOperators((prevOperators: any) => [...prevOperators, []]);
    setInputValues((prevInputs: any) => [...prevInputs, []]);
  };

  const generateRule = (groupIndex: number) => {
    setGroups((prevGroups: any) => {
      const updatedGroups = [...prevGroups]; //to return the old groups as well appended with the new rule
      updatedGroups[groupIndex] = {
        //add a new rule to the selected group after creating a copy of it to return old rules too
        ...updatedGroups[groupIndex],
        rules: [...updatedGroups[groupIndex].rules, {}], // Append a new rule to th
      };
      return updatedGroups;
    });
    setIsNewRule(true);
    setSelectedLabels((prevLabels: any) => [...prevLabels, []]);
    setSelectedOperators((prevOperators: any) => [...prevOperators, []]);
    setInputValues((prevInputs: any) => [...prevInputs, []]);
  };
  return (
    <>
      {groups[index] && groups[index].rules && groups[index].rules.length > 0 && (
        <div className="builder-group-container flex flex-col gap-1">
          {index !== 0 && (
            <div className="builder-group-operators flex flex-row w-1/3 h-10 gap-2">
              <button
                className={
                  isAndGroupActive[index]
                    ? cn(
                        'builder-and-group',
                        'grow rounded-md border-2  border-purple-400 bg-white',
                      )
                    : cn('builder-and-group', ' grow rounded-md border-2 bg-purple-400')
                }
                onClick={() => setGroupAndOperator(index)}
              >
                And
              </button>
              <button
                className={
                  isOrGroupActive[index]
                    ? cn('builder-or-group', 'grow rounded-md border-2  border-purple-400 bg-white')
                    : cn('builder-or-group', ' grow rounded-md border-2 bg-purple-400')
                }
                onClick={() => setGroupOrOperator(index)}
              >
                Or
              </button>
            </div>
          )}
          <div
            id={'group' + index}
            className={cn(
              'builder',
              'flex flex-col gap-4 h-full border border-slate-200 rounded-lg p-2',
            )}
          >
            <div
              className={cn(
                'builder-header',
                'flex flex-row justify-between items-center gap-10 h-fit ',
              )}
            >
              <div className={cn('builder-andOrExcept', 'flex flex-row w-1/5 h-10 gap-2')}>
                <button
                  className={
                    isAndActive[index]
                      ? cn('builder-and', 'grow rounded-md border-2 bg-purple-400')
                      : cn('builder-and', ' grow rounded-md border-2  border-purple-400 bg-white')
                  }
                  onClick={() => setAndOperator(index)}
                >
                  And
                </button>
                <button
                  className={
                    isOrActive[index]
                      ? cn('builder-or', 'grow rounded-md  border-2 bg-purple-400')
                      : cn(
                          'builder-or',
                          'grow rounded-md border-2 border-purple-400 bg-white hover:bg-sky-700',
                        )
                  }
                  onClick={() => {
                    setOrOperator(index);
                  }}
                >
                  Or
                </button>
                <button
                  className={
                    isExceptActive[index]
                      ? cn('builder-except', 'grow rounded-md  border-2 bg-purple-400')
                      : cn('builder-except', 'grow rounded-md border-2 border-purple-400 bg-white ')
                  }
                  onClick={() => {
                    setExceptOperator(index);
                  }}
                >
                  Except
                </button>
              </div>
              <div className="flex flex-row justify-start gap-1 w-1/6 h-10">
                <button
                  className={cn('builder-rule', 'grow rounded-md bg-purple-400 w-1/2')}
                  onClick={() => generateRule(index)}
                >
                  + Rule
                </button>
                <button
                  className={cn('builder-group', 'grow rounded-md bg-purple-400 w-1/2')}
                  onClick={generateGroup}
                >
                  + Group
                </button>
              </div>
            </div>
            <div className={cn('builder-body', 'flex flex-col grow p-2')}>
              {/* Render defaultInputs if they exist and for the first group */}
              {defaultInputs.length > 0 && index === 0 && !isNewRule && (
                <div className="flex flex-col justify-start gap-1">
                  {defaultInputs.map((input: any, inputIndex: number) => (
                    <div className="builder-rule-line flex items-center" key={inputIndex}>
                      <NewRule
                        defaultInput={input}
                        labelSelect={labelSelect}
                        operator={operator}
                        properties={properties}
                        groupIndex={index}
                        ruleIndex={inputIndex}
                        selectedOperators={selectedOperators}
                        updateOperator={updateOperator}
                        inputRefs={inputRefs}
                        inputValues={inputValues}
                        setInputValues={setInputValues}
                        allProperties={allProperties}
                        selectedRelatedLabels={selectedRelatedLabels}
                        selectedLabels={selectedLabels}
                        setRelatedAttributes={setRelatedAttributes}
                        relatedAttributes={relatedAttributes}
                        isCleared={isCleared}
                        setIsCleared={setIsCleared}
                        setSelectedLabels={setSelectedLabels}
                        setSelectedRelatedLabels={setSelectedRelatedLabels}
                        setFinalLabels={setFinalLabels}
                      />
                      <button
                        className={cn(
                          'builder-remove',
                          'bg-white h-fit p-3 rounded-md border-2 border-rose-500 text-rose-500',
                        )}
                        onClick={() => removeRule(index, inputIndex)}
                      >
                        <FaRegTrashAlt />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {/* Render rules from groups */}
              {(defaultInputs.length === 0 || isNewRule || index > 0) &&
                groups[index]?.rules?.map((_: any, ruleIndex: number) => (
                  <div
                    key={ruleIndex} // Ensure unique key for each rule
                    className={cn('builder-rule-line', 'flex items-center')}
                  >
                    <NewRule
                      defaultInput={null} // No default input for rules from groups
                      labelSelect={labelSelect}
                      operator={operator}
                      properties={properties}
                      groupIndex={index}
                      ruleIndex={ruleIndex}
                      selectedOperators={selectedOperators}
                      updateOperator={updateOperator}
                      inputRefs={inputRefs}
                      inputValues={inputValues}
                      setInputValues={setInputValues}
                      allProperties={allProperties}
                      selectedRelatedLabels={selectedRelatedLabels}
                      selectedLabels={selectedLabels}
                      setRelatedAttributes={setRelatedAttributes}
                      relatedAttributes={relatedAttributes}
                      isCleared={isCleared}
                      setIsCleared={setIsCleared}
                      setSelectedLabels={setSelectedLabels}
                      setSelectedRelatedLabels={setSelectedRelatedLabels}
                      setFinalLabels={setFinalLabels}
                    />
                    <button
                      className={cn(
                        'builder-remove',
                        'bg-white h-fit p-3 rounded-md border-2 border-rose-500 text-rose-500',
                      )}
                      onClick={() => removeRule(index, ruleIndex)}
                    >
                      <FaRegTrashAlt />
                    </button>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NewGroup;
