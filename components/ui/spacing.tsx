/**
 * Sandstone Spacing Components
 * 
 * React components for consistent spacing throughout the application.
 * These components implement the spacing system with semantic meaning.
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { type SpacingKey, semanticSpacing } from '@/lib/spacing';

// ============================================
// TYPES
// ============================================

type SpacingValue = SpacingKey | 'none';

interface SpacingProps {
  children: React.ReactNode;
  className?: string;
}

interface StackProps extends SpacingProps {
  space?: SpacingValue;
  align?: 'start' | 'center' | 'end' | 'stretch';
  as?: keyof JSX.IntrinsicElements;
}

interface InlineProps extends SpacingProps {
  space?: SpacingValue;
  align?: 'start' | 'center' | 'end' | 'baseline';
  wrap?: boolean;
  as?: keyof JSX.IntrinsicElements;
}

interface GridProps extends SpacingProps {
  columns?: number | { sm?: number; md?: number; lg?: number; xl?: number };
  gap?: SpacingValue;
  rowGap?: SpacingValue;
  columnGap?: SpacingValue;
  as?: keyof JSX.IntrinsicElements;
}

interface BoxProps extends SpacingProps {
  padding?: SpacingValue;
  paddingX?: SpacingValue;
  paddingY?: SpacingValue;
  paddingTop?: SpacingValue;
  paddingRight?: SpacingValue;
  paddingBottom?: SpacingValue;
  paddingLeft?: SpacingValue;
  margin?: SpacingValue;
  marginX?: SpacingValue;
  marginY?: SpacingValue;
  marginTop?: SpacingValue;
  marginRight?: SpacingValue;
  marginBottom?: SpacingValue;
  marginLeft?: SpacingValue;
  as?: keyof JSX.IntrinsicElements;
}

interface ContainerProps extends SpacingProps {
  size?: 'narrow' | 'default' | 'wide' | 'full';
  padding?: boolean;
  center?: boolean;
}

interface SectionProps extends SpacingProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  paddingX?: boolean;
  background?: string;
}

interface ClusterProps extends SpacingProps {
  space?: SpacingValue;
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  align?: 'start' | 'center' | 'end' | 'stretch';
  wrap?: boolean;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

const spacingMap: Record<string, string> = {
  'none': '',
  '0': '0',
  '0.5': '0.5',
  '1': '1',
  '1.5': '1.5',
  '2': '2',
  '2.5': '2.5',
  '3': '3',
  '3.5': '3.5',
  '4': '4',
  '4.5': '4.5',
  '5': '5',
  '5.5': '5.5',
  '6': '6',
  '7': '7',
  '8': '8',
  '9': '9',
  '10': '10',
  '11': '11',
  '12': '12',
  '14': '14',
  '16': '16',
  '18': '18',
  '20': '20',
  '24': '24',
  '28': '28',
  '32': '32',
  '36': '36',
  '40': '40',
  '44': '44',
  '48': '48',
  '52': '52',
  '56': '56',
  '60': '60',
  '64': '64',
  '72': '72',
  '80': '80',
};

const getSpacingClass = (prefix: string, value?: SpacingValue): string => {
  if (!value || value === 'none') return '';
  const spacingValue = spacingMap[value];
  if (!spacingValue) return '';
  return `${prefix}-${spacingValue}`;
};

// ============================================
// STACK COMPONENT (Vertical spacing)
// ============================================

/**
 * Stack - Vertical layout with consistent spacing between children
 * 
 * @example
 * <Stack space="4">
 *   <div>Item 1</div>
 *   <div>Item 2</div>
 *   <div>Item 3</div>
 * </Stack>
 */
export const Stack = React.forwardRef<HTMLElement, StackProps>(
  ({ children, space = '4', align = 'stretch', className, as: Component = 'div', ...props }, ref) => {
    const spaceClass = space === 'none' ? '' : `space-y-${spacingMap[space]}`;
    const alignClass = {
      start: 'items-start',
      center: 'items-center',
      end: 'items-end',
      stretch: 'items-stretch',
    }[align];

    return React.createElement(
      Component,
      {
        ref,
        className: cn('flex flex-col', spaceClass, alignClass, className),
        ...props,
      },
      children
    );
  }
);
Stack.displayName = 'Stack';

// ============================================
// INLINE COMPONENT (Horizontal spacing)
// ============================================

/**
 * Inline - Horizontal layout with consistent spacing between children
 * 
 * @example
 * <Inline space="4">
 *   <button>Button 1</button>
 *   <button>Button 2</button>
 *   <button>Button 3</button>
 * </Inline>
 */
export const Inline = React.forwardRef<HTMLElement, InlineProps>(
  ({ children, space = '4', align = 'center', wrap = true, className, as: Component = 'div', ...props }, ref) => {
    const spaceClass = space === 'none' ? '' : `space-x-${spacingMap[space]}`;
    const alignClass = {
      start: 'items-start',
      center: 'items-center',
      end: 'items-end',
      baseline: 'items-baseline',
    }[align];

    return React.createElement(
      Component,
      {
        ref,
        className: cn('flex', spaceClass, alignClass, wrap && 'flex-wrap', className),
        ...props,
      },
      children
    );
  }
);
Inline.displayName = 'Inline';

// ============================================
// GRID COMPONENT
// ============================================

/**
 * Grid - CSS Grid layout with configurable columns and gaps
 * 
 * @example
 * <Grid columns={3} gap="4">
 *   <div>Item 1</div>
 *   <div>Item 2</div>
 *   <div>Item 3</div>
 * </Grid>
 * 
 * @example
 * <Grid columns={{ sm: 1, md: 2, lg: 3 }} gap="6">
 *   {items.map(item => <Card key={item.id} {...item} />)}
 * </Grid>
 */
export const Grid = React.forwardRef<HTMLElement, GridProps>(
  ({ children, columns = 1, gap = '4', rowGap, columnGap, className, as: Component = 'div', ...props }, ref) => {
    const getColumnClass = (cols: number): string => {
      const colMap: Record<number, string> = {
        1: 'grid-cols-1',
        2: 'grid-cols-2',
        3: 'grid-cols-3',
        4: 'grid-cols-4',
        5: 'grid-cols-5',
        6: 'grid-cols-6',
        7: 'grid-cols-7',
        8: 'grid-cols-8',
        9: 'grid-cols-9',
        10: 'grid-cols-10',
        11: 'grid-cols-11',
        12: 'grid-cols-12',
      };
      return colMap[cols] || 'grid-cols-1';
    };

    const gapClass = gap === 'none' ? '' : `gap-${spacingMap[gap]}`;
    const rowGapClass = rowGap && rowGap !== 'none' ? `gap-y-${spacingMap[rowGap]}` : '';
    const colGapClass = columnGap && columnGap !== 'none' ? `gap-x-${spacingMap[columnGap]}` : '';

    let columnClasses = '';
    if (typeof columns === 'number') {
      columnClasses = getColumnClass(columns);
    } else {
      const responsiveCols: string[] = [];
      if (columns.sm) responsiveCols.push(`sm:${getColumnClass(columns.sm)}`);
      if (columns.md) responsiveCols.push(`md:${getColumnClass(columns.md)}`);
      if (columns.lg) responsiveCols.push(`lg:${getColumnClass(columns.lg)}`);
      if (columns.xl) responsiveCols.push(`xl:${getColumnClass(columns.xl)}`);
      columnClasses = responsiveCols.join(' ');
    }

    return React.createElement(
      Component,
      {
        ref,
        className: cn('grid', columnClasses, gapClass, rowGapClass, colGapClass, className),
        ...props,
      },
      children
    );
  }
);
Grid.displayName = 'Grid';

// ============================================
// BOX COMPONENT (Padding & Margin wrapper)
// ============================================

/**
 * Box - Flexible spacing wrapper with padding and margin controls
 * 
 * @example
 * <Box padding="4" marginY="2">
 *   <Content />
 * </Box>
 */
export const Box = React.forwardRef<HTMLElement, BoxProps>(
  (
    {
      children,
      padding,
      paddingX,
      paddingY,
      paddingTop,
      paddingRight,
      paddingBottom,
      paddingLeft,
      margin,
      marginX,
      marginY,
      marginTop,
      marginRight,
      marginBottom,
      marginLeft,
      className,
      as: Component = 'div',
      ...props
    },
    ref
  ) => {
    const classes = cn(
      getSpacingClass('p', padding),
      getSpacingClass('px', paddingX),
      getSpacingClass('py', paddingY),
      getSpacingClass('pt', paddingTop),
      getSpacingClass('pr', paddingRight),
      getSpacingClass('pb', paddingBottom),
      getSpacingClass('pl', paddingLeft),
      getSpacingClass('m', margin),
      getSpacingClass('mx', marginX),
      getSpacingClass('my', marginY),
      getSpacingClass('mt', marginTop),
      getSpacingClass('mr', marginRight),
      getSpacingClass('mb', marginBottom),
      getSpacingClass('ml', marginLeft),
      className
    );

    return React.createElement(
      Component,
      { ref, className: classes || undefined, ...props },
      children
    );
  }
);
Box.displayName = 'Box';

// ============================================
// CONTAINER COMPONENT
// ============================================

/**
 * Container - Centered content container with max-width
 * 
 * @example
 * <Container size="default" padding>
 *   <PageContent />
 * </Container>
 */
export const Container = React.forwardRef<HTMLElement, ContainerProps>(
  ({ children, size = 'default', padding = true, center = true, className, ...props }, ref) => {
    const sizeClass = {
      narrow: 'max-w-container-narrow',
      default: 'max-w-container-default',
      wide: 'max-w-container-wide',
      full: 'max-w-container-full',
    }[size];

    return React.createElement(
      'div',
      {
        ref,
        className: cn(
          'w-full',
          sizeClass,
          padding && 'px-4 sm:px-6 md:px-8 lg:px-12',
          center && 'mx-auto',
          className
        ),
        ...props,
      },
      children
    );
  }
);
Container.displayName = 'Container';

// ============================================
// SECTION COMPONENT
// ============================================

/**
 * Section - Page section with consistent vertical spacing
 * 
 * @example
 * <Section size="lg" paddingX>
 *   <h2>Section Title</h2>
 *   <p>Section content...</p>
 * </Section>
 */
export const Section = React.forwardRef<HTMLElement, SectionProps>(
  ({ children, size = 'md', paddingX = true, background, className, ...props }, ref) => {
    const sizeClass = {
      xs: 'py-8',
      sm: 'py-12',
      md: 'py-16',
      lg: 'py-20',
      xl: 'py-24',
      '2xl': 'py-32',
    }[size];

    return React.createElement(
      'section',
      {
        ref,
        className: cn(
          sizeClass,
          paddingX && 'px-4 sm:px-6 md:px-8 lg:px-12',
          className
        ),
        style: background ? { backgroundColor: background } : undefined,
        ...props,
      },
      children
    );
  }
);
Section.displayName = 'Section';

// ============================================
// CLUSTER COMPONENT (Flexbox cluster)
// ============================================

/**
 * Cluster - Flexbox layout with consistent spacing and alignment
 * 
 * @example
 * <Cluster space="4" justify="between" align="center">
 *   <Logo />
 *   <Navigation />
 * </Cluster>
 */
export const Cluster = React.forwardRef<HTMLElement, ClusterProps>(
  ({ children, space = '4', justify = 'start', align = 'center', wrap = true, className, ...props }, ref) => {
    const spaceClass = space === 'none' ? '' : `gap-${spacingMap[space]}`;
    const justifyClass = {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
      between: 'justify-between',
      around: 'justify-around',
      evenly: 'justify-evenly',
    }[justify];
    const alignClass = {
      start: 'items-start',
      center: 'items-center',
      end: 'items-end',
      stretch: 'items-stretch',
    }[align];

    return React.createElement(
      'div',
      {
        ref,
        className: cn('flex', spaceClass, justifyClass, alignClass, wrap && 'flex-wrap', className),
        ...props,
      },
      children
    );
  }
);
Cluster.displayName = 'Cluster';

// ============================================
// SPACER COMPONENT
// ============================================

/**
 * Spacer - Empty space element for flexible layouts
 * 
 * @example
 * <Inline space="4">
 *   <Button>Cancel</Button>
 *   <Spacer />
 *   <Button variant="primary">Save</Button>
 * </Inline>
 */
export const Spacer = ({ className }: { className?: string }) => {
  return <div className={cn('flex-1', className)} />;
};
Spacer.displayName = 'Spacer';

// ============================================
// DIVIDER COMPONENT
// ============================================

/**
 * Divider - Visual separator with consistent spacing
 * 
 * @example
 * <Stack space="4">
 *   <Content />
 *   <Divider />
 *   <MoreContent />
 * </Stack>
 */
interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  spacing?: SpacingValue;
  className?: string;
}

export const Divider = ({ orientation = 'horizontal', spacing = '4', className }: DividerProps) => {
  const spacingClass = spacing === 'none' ? '' : `my-${spacingMap[spacing]}`;
  
  return (
    <div
      className={cn(
        'bg-border',
        orientation === 'horizontal' 
          ? cn('h-px w-full', spacingClass) 
          : cn('w-px h-full', spacingClass.replace('my-', 'mx-')),
        className
      )}
      role="separator"
    />
  );
};
Divider.displayName = 'Divider';

// ============================================
// VISUAL RHYTHM DEBUGGER
// ============================================

/**
 * RhythmDebugger - Visual overlay for debugging spacing
 * 
 * @example
 * <RhythmDebugger enabled={process.env.NODE_ENV === 'development'}>
 *   <YourApp />
 * </RhythmDebugger>
 */
interface RhythmDebuggerProps {
  children: React.ReactNode;
  enabled?: boolean;
  baseUnit?: number;
}

export const RhythmDebugger = ({ children, enabled = false, baseUnit = 4 }: RhythmDebuggerProps) => {
  if (!enabled) return <>{children}</>;

  return (
    <div className="relative">
      {children}
      <div
        className="pointer-events-none fixed inset-0 z-[9999] opacity-10"
        style={{
          backgroundImage: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent ${baseUnit - 1}px,
            rgba(255, 0, 0, 0.3) ${baseUnit - 1}px,
            rgba(255, 0, 0, 0.3) ${baseUnit}px
          )`,
        }}
      />
    </div>
  );
};
RhythmDebugger.displayName = 'RhythmDebugger';

// ============================================
// EXPORTS
// ============================================

export {
  semanticSpacing,
  spacingMap,
  getSpacingClass,
};

export type {
  SpacingValue,
  StackProps,
  InlineProps,
  GridProps,
  BoxProps,
  ContainerProps,
  SectionProps,
  ClusterProps,
  DividerProps,
  RhythmDebuggerProps,
};
