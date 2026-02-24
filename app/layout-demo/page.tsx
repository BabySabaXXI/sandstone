"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Grid,
  GridItem,
  VStack,
  HStack,
  Flex,
  FlexItem,
  Container,
  Center,
  Spacer,
} from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LayoutGrid,
  Columns,
  Rows,
  Maximize,
  Minimize,
  AlignCenter,
  AlignLeft,
  AlignRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================================================
// DEMO COMPONENTS
// ============================================================================

const DemoBox = ({
  children,
  className,
  color = "bg-accent",
}: {
  children?: React.ReactNode;
  className?: string;
  color?: string;
}) => (
  <div
    className={cn(
      "p-4 rounded-lg flex items-center justify-center min-h-[80px] text-sm font-medium",
      color,
      className
    )}
  >
    {children}
  </div>
);

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h2 className="text-h3 text-foreground mb-4">{children}</h2>
);

const SectionDescription = ({ children }: { children: React.ReactNode }) => (
  <p className="text-body-sm text-muted-foreground mb-6">{children}</p>
);

// ============================================================================
// GRID DEMO
// ============================================================================

const GridDemo = () => {
  const [cols, setCols] = useState<1 | 2 | 3 | 4 | 6 | 12>(4);
  const [gap, setGap] = useState<0 | 2 | 4 | 6 | 8>(4);

  return (
    <div className="space-y-6">
      <div>
        <SectionTitle>Grid System</SectionTitle>
        <SectionDescription>
          Responsive grid with configurable columns and gaps. Supports auto-fit and auto-fill modes.
        </SectionDescription>
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="p-4">
          <HStack gap={4} align="center" wrap>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Columns:</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 6, 12].map((c) => (
                  <Button
                    key={c}
                    variant={cols === c ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCols(c as any)}
                  >
                    {c}
                  </Button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Gap:</span>
              <div className="flex gap-1">
                {[0, 2, 4, 6, 8].map((g) => (
                  <Button
                    key={g}
                    variant={gap === g ? "default" : "outline"}
                    size="sm"
                    onClick={() => setGap(g as any)}
                  >
                    {g}
                  </Button>
                ))}
              </div>
            </div>
          </HStack>
        </CardContent>
      </Card>

      {/* Grid Demo */}
      <Grid cols={cols} gap={gap}>
        {Array.from({ length: 12 }).map((_, i) => (
          <DemoBox key={i} color={i % 2 === 0 ? "bg-accent/50" : "bg-secondary/50"}>
            Item {i + 1}
          </DemoBox>
        ))}
      </Grid>

      {/* Responsive Grid */}
      <div className="mt-8">
        <h3 className="text-h4 text-foreground mb-4">Responsive Grid</h3>
        <SectionDescription>
          Grid that adapts to different screen sizes: 1 col (mobile), 2 cols (tablet), 4 cols (desktop)
        </SectionDescription>
        <Grid cols={1} colsSm={2} colsMd={3} colsLg={4} gap={4}>
          {Array.from({ length: 8 }).map((_, i) => (
            <DemoBox key={i} color={i % 2 === 0 ? "bg-peach-100/50" : "bg-sage-100/50"}>
              Responsive {i + 1}
            </DemoBox>
          ))}
        </Grid>
      </div>

      {/* Auto-fit Grid */}
      <div className="mt-8">
        <h3 className="text-h4 text-foreground mb-4">Auto-fit Grid</h3>
        <SectionDescription>
          Grid that automatically fits items with a minimum width
        </SectionDescription>
        <Grid autoFit minChildWidth="200px" gap={4}>
          {Array.from({ length: 6 }).map((_, i) => (
            <DemoBox key={i} color={i % 2 === 0 ? "bg-blue-100/50" : "bg-accent/50"}>
              Auto-fit {i + 1}
            </DemoBox>
          ))}
        </Grid>
      </div>
    </div>
  );
};

// ============================================================================
// STACK DEMO
// ============================================================================

const StackDemo = () => {
  return (
    <div className="space-y-6">
      <div>
        <SectionTitle>Stack System</SectionTitle>
        <SectionDescription>
          Vertical (VStack) and Horizontal (HStack) layouts with consistent spacing.
        </SectionDescription>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* VStack Demo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Rows className="w-5 h-5" />
              VStack (Vertical)
            </CardTitle>
            <CardDescription>Vertical stack with gap-4</CardDescription>
          </CardHeader>
          <CardContent>
            <VStack gap={4}>
              <DemoBox color="bg-accent/50">Item 1</DemoBox>
              <DemoBox color="bg-secondary/50">Item 2</DemoBox>
              <DemoBox color="bg-accent/50">Item 3</DemoBox>
            </VStack>
          </CardContent>
        </Card>

        {/* HStack Demo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Columns className="w-5 h-5" />
              HStack (Horizontal)
            </CardTitle>
            <CardDescription>Horizontal stack with gap-4</CardDescription>
          </CardHeader>
          <CardContent>
            <HStack gap={4}>
              <DemoBox color="bg-peach-100/50" className="flex-1">A</DemoBox>
              <DemoBox color="bg-sage-100/50" className="flex-1">B</DemoBox>
              <DemoBox color="bg-blue-100/50" className="flex-1">C</DemoBox>
            </HStack>
          </CardContent>
        </Card>
      </div>

      {/* Alignment Demo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlignCenter className="w-5 h-5" />
            Alignment Options
          </CardTitle>
        </CardHeader>
        <CardContent>
          <VStack gap={6}>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Align: Start</p>
              <HStack gap={2} align="start" className="h-24 bg-muted/30 rounded-lg p-2">
                <DemoBox color="bg-accent/50" className="h-12">Small</DemoBox>
                <DemoBox color="bg-secondary/50" className="h-20">Tall</DemoBox>
                <DemoBox color="bg-accent/50" className="h-16">Medium</DemoBox>
              </HStack>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Align: Center</p>
              <HStack gap={2} align="center" className="h-24 bg-muted/30 rounded-lg p-2">
                <DemoBox color="bg-accent/50" className="h-12">Small</DemoBox>
                <DemoBox color="bg-secondary/50" className="h-20">Tall</DemoBox>
                <DemoBox color="bg-accent/50" className="h-16">Medium</DemoBox>
              </HStack>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Align: End</p>
              <HStack gap={2} align="end" className="h-24 bg-muted/30 rounded-lg p-2">
                <DemoBox color="bg-accent/50" className="h-12">Small</DemoBox>
                <DemoBox color="bg-secondary/50" className="h-20">Tall</DemoBox>
                <DemoBox color="bg-accent/50" className="h-16">Medium</DemoBox>
              </HStack>
            </div>
          </VStack>
        </CardContent>
      </Card>
    </div>
  );
};

// ============================================================================
// FLEX DEMO
// ============================================================================

const FlexDemo = () => {
  return (
    <div className="space-y-6">
      <div>
        <SectionTitle>Flex System</SectionTitle>
        <SectionDescription>
          Advanced flexbox layouts with grow, shrink, and basis control.
        </SectionDescription>
      </div>

      {/* Flex Grow Demo */}
      <Card>
        <CardHeader>
          <CardTitle>Flex Grow</CardTitle>
          <CardDescription>Items with different flex-grow values</CardDescription>
        </CardHeader>
        <CardContent>
          <Flex gap={2} className="h-20">
            <FlexItem grow={false} className="bg-accent/50 rounded-lg flex items-center justify-center">
              Fixed
            </FlexItem>
            <FlexItem grow className="bg-secondary/50 rounded-lg flex items-center justify-center">
              Grow (1)
            </FlexItem>
            <FlexItem grow={2} className="bg-accent/50 rounded-lg flex items-center justify-center">
              Grow (2)
            </FlexItem>
          </Flex>
        </CardContent>
      </Card>

      {/* Flex Basis Demo */}
      <Card>
        <CardHeader>
          <CardTitle>Flex Basis</CardTitle>
          <CardDescription>Items with different flex-basis values</CardDescription>
        </CardHeader>
        <CardContent>
          <Flex gap={2} wrap>
            <FlexItem basis="1/4" className="bg-peach-100/50 rounded-lg p-4 text-center">
              25%
            </FlexItem>
            <FlexItem basis="1/4" className="bg-sage-100/50 rounded-lg p-4 text-center">
              25%
            </FlexItem>
            <FlexItem basis="1/2" className="bg-blue-100/50 rounded-lg p-4 text-center">
              50%
            </FlexItem>
          </Flex>
        </CardContent>
      </Card>

      {/* Center Demo */}
      <Card>
        <CardHeader>
          <CardTitle>Center Component</CardTitle>
          <CardDescription>Quick centering utility</CardDescription>
        </CardHeader>
        <CardContent>
          <Center className="h-32 bg-muted/30 rounded-lg">
            <DemoBox color="bg-accent/50">Centered Content</DemoBox>
          </Center>
        </CardContent>
      </Card>

      {/* Spacer Demo */}
      <Card>
        <CardHeader>
          <CardTitle>Spacer Component</CardTitle>
          <CardDescription>Flexible space that pushes content apart</CardDescription>
        </CardHeader>
        <CardContent>
          <Flex className="h-12">
            <DemoBox color="bg-accent/50" className="w-24">Left</DemoBox>
            <Spacer />
            <DemoBox color="bg-secondary/50" className="w-24">Right</DemoBox>
          </Flex>
        </CardContent>
      </Card>
    </div>
  );
};

// ============================================================================
// CONTAINER DEMO
// ============================================================================

const ContainerDemo = () => {
  const sizes: Array<"xs" | "sm" | "md" | "lg" | "xl" | "narrow" | "wide" | "full"> = [
    "xs",
    "sm",
    "md",
    "lg",
    "xl",
    "narrow",
    "wide",
    "full",
  ];

  return (
    <div className="space-y-6">
      <div>
        <SectionTitle>Container System</SectionTitle>
        <SectionDescription>
          Responsive containers with consistent max-widths and padding.
        </SectionDescription>
      </div>

      <VStack gap={4}>
        {sizes.map((size) => (
          <div key={size} className="relative">
            <div className="absolute -left-4 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-mono">
              {size}
            </div>
            <Container size={size} className="bg-muted/30 rounded-lg border border-dashed border-border">
              <div className="py-2 px-4 text-sm text-muted-foreground text-center">
                Container: {size}
              </div>
            </Container>
          </div>
        ))}
      </VStack>
    </div>
  );
};

// ============================================================================
// SPACING DEMO
// ============================================================================

const SpacingDemo = () => {
  const spacingValues = [0, 1, 2, 3, 4, 5, 6, 8, 10, 12];

  return (
    <div className="space-y-6">
      <div>
        <SectionTitle>Spacing Scale</SectionTitle>
        <SectionDescription>
          Consistent 4px-based spacing scale used throughout the application.
        </SectionDescription>
      </div>

      <Card>
        <CardContent className="p-6">
          <VStack gap={4}>
            {spacingValues.map((space) => (
              <HStack key={space} gap={4} align="center">
                <div className="w-16 text-sm text-muted-foreground font-mono">
                  {space * 4}px
                </div>
                <div className="flex-1 bg-muted/30 rounded overflow-hidden">
                  <div
                    className="h-8 bg-accent/50 rounded"
                    style={{ width: `${space * 4 + 16}px` }}
                  />
                </div>
                <Badge variant="outline">space-{space}</Badge>
              </HStack>
            ))}
          </VStack>
        </CardContent>
      </Card>
    </div>
  );
};

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function LayoutDemoPage() {
  return (
    <Container size="wide" padding={6}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="mb-8">
          <HStack gap={3} align="center" className="mb-2">
            <LayoutGrid className="w-8 h-8 text-accent" />
            <h1 className="text-hero text-foreground">Layout System</h1>
          </HStack>
          <p className="text-body text-muted-foreground max-w-2xl">
            A comprehensive layout system featuring Grid, Flexbox, Container Queries,
            and consistent spacing for the Sandstone application.
          </p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="grid" className="space-y-6">
          <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full">
            <TabsTrigger value="grid" className="flex items-center gap-2">
              <LayoutGrid className="w-4 h-4" />
              Grid
            </TabsTrigger>
            <TabsTrigger value="stack" className="flex items-center gap-2">
              <Rows className="w-4 h-4" />
              Stack
            </TabsTrigger>
            <TabsTrigger value="flex" className="flex items-center gap-2">
              <Maximize className="w-4 h-4" />
              Flex
            </TabsTrigger>
            <TabsTrigger value="container" className="flex items-center gap-2">
              <Minimize className="w-4 h-4" />
              Container
            </TabsTrigger>
            <TabsTrigger value="spacing" className="flex items-center gap-2">
              <AlignCenter className="w-4 h-4" />
              Spacing
            </TabsTrigger>
          </TabsList>

          <TabsContent value="grid" className="mt-6">
            <GridDemo />
          </TabsContent>

          <TabsContent value="stack" className="mt-6">
            <StackDemo />
          </TabsContent>

          <TabsContent value="flex" className="mt-6">
            <FlexDemo />
          </TabsContent>

          <TabsContent value="container" className="mt-6">
            <ContainerDemo />
          </TabsContent>

          <TabsContent value="spacing" className="mt-6">
            <SpacingDemo />
          </TabsContent>
        </Tabs>

        {/* Usage Example */}
        <Card className="mt-12">
          <CardHeader>
            <CardTitle>Usage Example</CardTitle>
            <CardDescription>How to use the layout components in your code</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm font-mono">
              <code>{`import { Grid, VStack, HStack, Container } from "@/components/layout";

// Grid layout
<Grid cols={3} gap={4}>
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</Grid>

// Vertical stack
<VStack gap={4} align="center">
  <div>Item 1</div>
  <div>Item 2</div>
</VStack>

// Horizontal stack
<HStack gap={4} justify="between">
  <div>Left</div>
  <div>Right</div>
</HStack>

// Container
<Container size="wide" padding={6}>
  <div>Your content here</div>
</Container>`}</code>
            </pre>
          </CardContent>
        </Card>
      </motion.div>
    </Container>
  );
}
