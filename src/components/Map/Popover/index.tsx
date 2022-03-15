// Import Dependencies
import React from "react";
import { Callout, Separator, Text, Target, getTheme, FontWeights, mergeStyleSets } from '@fluentui/react';

// Styles 

const theme = getTheme();
const styles = mergeStyleSets({
  callout: {
    maxWidth: 150,
    pointerEvents: 'none',
  },
  header: {
    padding: '18px 24px 12px',
  },
  title: [
    theme.fonts.xLarge,
    {
      margin: 0,
      fontWeight: FontWeights.semilight,
    },
  ],
});

// Interfaces

interface PopoverProps {
  title: string;
  body: React.ReactElement;
  target: Target;
  onDismiss?: () => void;
}

// Popover Component
const Popover: React.FC<PopoverProps> = ({ title, body, target, onDismiss }) => {
  return (
    <Callout
      className={styles.callout}
      gapSpace={0}
      target={target}
      onDismiss={onDismiss}
      setInitialFocus
    >
      {title.length !== 0 &&
      <>
        <div className={styles.header}>
          <Text className={styles.title}>
            {title}
          </Text>
        </div>
        <Separator />
      </>
      }
      {body}
    </Callout>
  );
}

// Export the popover component
export default Popover;
