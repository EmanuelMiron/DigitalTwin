// Rendered when there are no favorites selected ( left sidebar )

// Import Styles
import './NoFavorites.scss';

// Import Dependencies
import React from 'react';
import { Callout, DirectionalHint } from '@fluentui/react';

// Import Componnts
import NoResults from '../../NoResults/NoResults';

// Interfaces
export interface NoFavoritesProps {
  target: string | Element | MouseEvent | React.RefObject<Element>;
  onDismiss?: () => void;
}

// Export NoFavorites Component
export const NoFavorites: React.FC<NoFavoritesProps> = ({
  target,
  onDismiss,
}) => {
    return (
      <Callout
        className="no-favorites"
        target={target}
        onDismiss={onDismiss}
        isBeakVisible={false}
        directionalHint={DirectionalHint.rightTopEdge}
        setInitialFocus
      >
        <NoResults title="No favorite locations"/>
      </Callout>
    )
};