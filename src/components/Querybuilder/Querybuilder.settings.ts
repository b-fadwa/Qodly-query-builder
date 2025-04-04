import { ESetting, TSetting } from '@ws-ui/webform-editor';
import { BASIC_SETTINGS, DEFAULT_SETTINGS, load } from '@ws-ui/webform-editor';

const commonSettings: TSetting[] = [
  {
    type: ESetting.DATAGRID,
    key: 'columns',
    label: 'Properties',
    titleProperty: 'title',
    data: [
      {
        label: 'Attribute',
        type: ESetting.DS_AUTO_SUGGEST,
        key: 'source',
      },
      //check type ...
    ],
  },
];

const Settings: TSetting[] = [
  {
    key: 'properties',
    label: 'Properties',
    type: ESetting.GROUP,
    components: commonSettings,
  },
  ...DEFAULT_SETTINGS,
];

export const BasicSettings: TSetting[] = [
  ...commonSettings,
  ...load(BASIC_SETTINGS).filter('style.overflow'),
];

export default Settings;
