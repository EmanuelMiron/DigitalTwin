// Import Dependencies
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Callout, DirectionalHint } from '@fluentui/react';

// Import Components
import { LayerChildrenMenu } from "./LayerChildrenMenu/LayerChildrenMenu";
import { Switch } from "./Switch/Switch";

// Import Reducers
import {
  LayersVisibilityState,
  selectLayersVisibility,
  setLayerVisibility,
} from '../../reducers/layersData';

// Import Services
import { mapService } from '../../services/mapService';

// Import Styles
import "./LayersSwitcher.scss";

// Interfaces
export interface LayerSwitcherProps {
  target: string | Element | MouseEvent | React.RefObject<Element>;
  onDismiss?: () => void;
}

// Export LayersSwitcher Component
export const LayersSwitcher: React.FC<LayerSwitcherProps> = ({ target, onDismiss }) => {
  const dispatch = useDispatch();
  const layersVisibility: LayersVisibilityState = useSelector(selectLayersVisibility);

  return (
    <Callout
      target={target}
      onDismiss={onDismiss}
      isBeakVisible={false}
      directionalHint={DirectionalHint.rightBottomEdge}
      setInitialFocus
    >
      <div className="layers-switcher">
        {
          mapService.getLayersInfo().map((layer) => {
            const { id, name } = layer;
            console.log(id);
            return <Switch
              name={name}
              isVisible={layersVisibility[id]}
              onSetVisibility={isVisible => dispatch(setLayerVisibility({ id, isVisible }))}
            >
              {layer.getChildren && <LayerChildrenMenu layer={layer} disabled={!layersVisibility[id]}/>}
            </Switch>
          })
        }
      </div>
    </Callout>
  );
}
