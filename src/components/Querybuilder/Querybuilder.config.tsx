import { EComponentKind, T4DComponentConfig } from '@ws-ui/webform-editor';
import { Settings } from '@ws-ui/webform-editor';
import { CiSearch } from 'react-icons/ci';

import QuerybuilderSettings, { BasicSettings } from './Querybuilder.settings';

export default {
  craft: {
    displayName: 'Querybuilder',
    kind: EComponentKind.BASIC,
    props: {
      name: '',
      classNames: [],
      events: [],
    },
    related: {
      settings: Settings(QuerybuilderSettings, BasicSettings),
    },
  },
  info: {
    displayName: 'Querybuilder',
    exposed: true,
    icon: CiSearch,
    events: [
      {
        label: 'On Click',
        value: 'onclick',
      },
      {
        label: 'On Blur',
        value: 'onblur',
      },
      {
        label: 'On Focus',
        value: 'onfocus',
      },
      {
        label: 'On MouseEnter',
        value: 'onmouseenter',
      },
      {
        label: 'On MouseLeave',
        value: 'onmouseleave',
      },
      {
        label: 'On KeyDown',
        value: 'onkeydown',
      },
      {
        label: 'On KeyUp',
        value: 'onkeyup',
      },
    ],
    datasources: {
      accept: ['entitysel'],
    },
  },
  defaultProps: {
    style: {
      width: '100%',
    },
  },
} as T4DComponentConfig<IQuerybuilderProps>;

export interface IQuerybuilderProps extends webforms.ComponentProps {
  dataAttributes: any[];
}
