
// Import Dependencies
import * as React from 'react';  
import { 
  getTheme, 
  mergeStyleSets, 
  FontWeights, 
  ContextualMenu,
  Modal, 
  IDragOptions, 
  IIconProps,
  IStyleFunctionOrObject,
  IModalStyleProps,
  IModalStyles,
} from '@fluentui/react';  
import { IconButton, IButtonStyles } from '@fluentui/react/lib/Button';  

const cancelIcon: IIconProps = { iconName: 'Cancel' };  

// Styles
const theme = getTheme(); 
const contentStyles = mergeStyleSets({ 
  container: { 
    display: 'flex',  
    flexFlow: 'column nowrap', 
    alignItems: 'stretch',
    minHeight: '50px'
  }, 
  header: [ 

    theme.fonts.xLargePlus, 
    { 
      flex: '1 1 auto', 
      color: theme.palette.neutralPrimary, 
      display: 'flex',  
      alignItems: 'center',  
      fontWeight: FontWeights.semibold, 
      padding: '12px 12px 14px 24px', 
    }, 
  ], 
  body: { 
    // flex: '1 1 auto', 
    // padding: '0 24px 24px 24px', 
    overflowY: 'hidden',
    width: '90%',
    margin: '0 auto'
  },
}); 

// Button Styles
const iconButtonStyles: Partial<IButtonStyles> = { 
  root: { 
    color: theme.palette.neutralPrimary, 
    marginLeft: 'auto',  
    marginTop: '4px',  
    marginRight: '2px',  
  }, 
  rootHovered: { 
    color: theme.palette.neutralDark, 
  }, 
}; 

// Prop Interface
interface DialogProps {
  title?: string;
  body?: React.ReactElement;
  keepInBounds?: boolean;
  isOpen?: boolean;
  isModeless?: boolean;
  draggable?: boolean;
  styles?: IStyleFunctionOrObject<IModalStyleProps, IModalStyles> 
  onDismiss?: () => void;
}

export const Dialog: React.FunctionComponent<DialogProps> = ({
  keepInBounds,
  isOpen,
  draggable,
  title,
  body,
  styles,
  isModeless,
  onDismiss
}) => {

  // Draggable Modal Options
  const dragOptions = React.useMemo( 
    (): IDragOptions => ({ 
      moveMenuItemText: 'Move',  
      closeMenuItemText: 'Close',  
      menu: ContextualMenu, 
      keepInBounds, 
    }), 
    [keepInBounds], 
  ); 

  return ( 
    <div>
      <Modal
        
        isModeless={isModeless}
        styles={styles}
        isOpen={isOpen}
        onDismiss={onDismiss} 
        isBlocking={false} 
        containerClassName={contentStyles.container} 
        dragOptions={draggable ? dragOptions : undefined} 
      > 
        <div className={contentStyles.header}> 
          <span className={'title'}>{title}</span> 
          <IconButton 
            styles={iconButtonStyles} 
            iconProps={cancelIcon} 
            ariaLabel="Close popup modal" 
            onClick={onDismiss} 
          /> 
        </div> 
        <div className={contentStyles.body}>
            {body}
        </div> 
      </Modal> 
    </div> 
  ); 
}; 