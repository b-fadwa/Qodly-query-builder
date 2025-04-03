import {
  EComponentKind,
  getDataTransferSourceID,
  IExostiveElementProps,
  isAttributePayload,
  isDatasourcePayload,
  T4DComponentConfig,
} from '@ws-ui/webform-editor';
import { Settings } from '@ws-ui/webform-editor';
import { CiSearch } from 'react-icons/ci';
import cloneDeep from 'lodash/cloneDeep';
import { generate } from 'short-uuid';
import { findIndex } from 'lodash';

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
      set: (nodeId, query, payload) => {
        const new_props = cloneDeep(query.node(nodeId).get().data.props) as IExostiveElementProps;
        payload.forEach((item) => {
          if (isDatasourcePayload(item)) {
            if (item.source.type === 'entitysel') {
              new_props.datasource = getDataTransferSourceID(item);
            }
          } else if (isAttributePayload(item)) {
            if (findIndex(new_props.columns, { source: item.attribute.name }) === -1)
              new_props.columns = [
                ...(new_props.columns || []),
                {
                  source: item.attribute.name,
                  id: generate(),
                } as any,
              ];
          }
        });
        return {
          [nodeId]: new_props,
        };
      },
    },
  },
  defaultProps: {
    style: {
      width: '100%',
    },
  },
} as T4DComponentConfig<IQuerybuilderProps>;

export interface IQuerybuilderProps extends webforms.ComponentProps {
  columns: any[];
}
