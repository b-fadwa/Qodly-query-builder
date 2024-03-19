import config, { IQuerybuilderProps } from './Querybuilder.config';
import { T4DComponent, useEnhancedEditor } from '@ws-ui/webform-editor';
import Build from './Querybuilder.build';
import Render from './Querybuilder.render';

const Querybuilder: T4DComponent<IQuerybuilderProps> = (props) => {
  const { enabled } = useEnhancedEditor((state) => ({
    enabled: state.options.enabled,
  }));

  return enabled ? <Build {...props} /> : <Render {...props} />;
};

Querybuilder.craft = config.craft;
Querybuilder.info = config.info;
Querybuilder.defaultProps = config.defaultProps;

export default Querybuilder;
