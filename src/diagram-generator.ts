/**
 * Diagram Generator - Creates Excalidraw elements for common diagram types
 */

interface ExcalidrawElement {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  angle: number;
  strokeColor: string;
  backgroundColor: string;
  fillStyle: string;
  strokeWidth: number;
  strokeStyle: string;
  roughness: number;
  opacity: number;
  roundness?: { type: number };
  seed: number;
  version: number;
  versionNonce: number;
  isDeleted: boolean;
  boundElements?: any[];
  updated: number;
  link: null;
  locked: boolean;
  text?: string;
  fontSize?: number;
  fontFamily?: number;
  textAlign?: string;
  verticalAlign?: string;
  baseline?: number;
  containerId?: string | null;
  originalText?: string;
  lineHeight?: number;
  startBinding?: any;
  endBinding?: any;
  points?: number[][];
  lastCommittedPoint?: null;
  startArrowhead?: null | string;
  endArrowhead?: null | string;
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

function createRectangle(
  x: number,
  y: number,
  width: number,
  height: number,
  text: string = '',
  color: string = '#1e1e1e'
): ExcalidrawElement[] {
  const elements: ExcalidrawElement[] = [];
  const boxId = generateId();

  // Rectangle
  elements.push({
    id: boxId,
    type: 'rectangle',
    x,
    y,
    width,
    height,
    angle: 0,
    strokeColor: color,
    backgroundColor: 'transparent',
    fillStyle: 'solid',
    strokeWidth: 2,
    strokeStyle: 'solid',
    roughness: 1,
    opacity: 100,
    roundness: { type: 3 },
    seed: Math.floor(Math.random() * 1000000),
    version: 1,
    versionNonce: Math.floor(Math.random() * 1000000),
    isDeleted: false,
    boundElements: [],
    updated: Date.now(),
    link: null,
    locked: false,
  });

  // Text inside rectangle
  if (text) {
    elements.push({
      id: generateId(),
      type: 'text',
      x: x + 10,
      y: y + height / 2 - 12,
      width: width - 20,
      height: 25,
      angle: 0,
      strokeColor: color,
      backgroundColor: 'transparent',
      fillStyle: 'solid',
      strokeWidth: 2,
      strokeStyle: 'solid',
      roughness: 1,
      opacity: 100,
      seed: Math.floor(Math.random() * 1000000),
      version: 1,
      versionNonce: Math.floor(Math.random() * 1000000),
      isDeleted: false,
      updated: Date.now(),
      link: null,
      locked: false,
      text,
      fontSize: 20,
      fontFamily: 1,
      textAlign: 'center',
      verticalAlign: 'middle',
      baseline: 18,
      containerId: boxId,
      originalText: text,
      lineHeight: 1.25,
    });
  }

  return elements;
}

function createArrow(
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  label: string = ''
): ExcalidrawElement[] {
  const elements: ExcalidrawElement[] = [];

  // Arrow
  elements.push({
    id: generateId(),
    type: 'arrow',
    x: fromX,
    y: fromY,
    width: toX - fromX,
    height: toY - fromY,
    angle: 0,
    strokeColor: '#1e1e1e',
    backgroundColor: 'transparent',
    fillStyle: 'solid',
    strokeWidth: 2,
    strokeStyle: 'solid',
    roughness: 1,
    opacity: 100,
    seed: Math.floor(Math.random() * 1000000),
    version: 1,
    versionNonce: Math.floor(Math.random() * 1000000),
    isDeleted: false,
    updated: Date.now(),
    link: null,
    locked: false,
    points: [
      [0, 0],
      [toX - fromX, toY - fromY],
    ],
    lastCommittedPoint: null,
    startBinding: null,
    endBinding: null,
    startArrowhead: null,
    endArrowhead: 'arrow',
  });

  // Label
  if (label) {
    const midX = fromX + (toX - fromX) / 2;
    const midY = fromY + (toY - fromY) / 2;

    elements.push({
      id: generateId(),
      type: 'text',
      x: midX - 50,
      y: midY - 20,
      width: 100,
      height: 25,
      angle: 0,
      strokeColor: '#1e1e1e',
      backgroundColor: '#ffffff',
      fillStyle: 'solid',
      strokeWidth: 2,
      strokeStyle: 'solid',
      roughness: 1,
      opacity: 100,
      seed: Math.floor(Math.random() * 1000000),
      version: 1,
      versionNonce: Math.floor(Math.random() * 1000000),
      isDeleted: false,
      updated: Date.now(),
      link: null,
      locked: false,
      text: label,
      fontSize: 16,
      fontFamily: 1,
      textAlign: 'center',
      verticalAlign: 'middle',
      baseline: 14,
      containerId: null,
      originalText: label,
      lineHeight: 1.25,
    });
  }

  return elements;
}

export interface FlowchartNode {
  id: string;
  text: string;
  type?: 'process' | 'decision' | 'start' | 'end';
}

export interface FlowchartEdge {
  from: string;
  to: string;
  label?: string;
}

export function createFlowchart(
  nodes: FlowchartNode[],
  edges: FlowchartEdge[]
): { elements: ExcalidrawElement[]; appState: any; files: any } {
  const elements: ExcalidrawElement[] = [];
  const nodePositions: { [key: string]: { x: number; y: number; width: number; height: number } } = {};

  // Layout nodes vertically
  let currentY = 100;
  const spacing = 150;
  const nodeWidth = 200;
  const nodeHeight = 80;

  nodes.forEach((node, index) => {
    const x = 400; // Center horizontally
    const y = currentY;

    // Create rectangle for node
    const nodeElements = createRectangle(x, y, nodeWidth, nodeHeight, node.text);
    elements.push(...nodeElements);

    // Store position for arrows
    nodePositions[node.id] = { x, y, width: nodeWidth, height: nodeHeight };

    currentY += nodeHeight + spacing;
  });

  // Create arrows
  edges.forEach((edge) => {
    const fromPos = nodePositions[edge.from];
    const toPos = nodePositions[edge.to];

    if (fromPos && toPos) {
      const fromX = fromPos.x + fromPos.width / 2;
      const fromY = fromPos.y + fromPos.height;
      const toX = toPos.x + toPos.width / 2;
      const toY = toPos.y;

      const arrowElements = createArrow(fromX, fromY, toX, toY, edge.label);
      elements.push(...arrowElements);
    }
  });

  return {
    elements,
    appState: {
      viewBackgroundColor: '#ffffff',
      currentItemFontFamily: 1,
      gridSize: null,
    },
    files: {},
  };
}

export interface ArchitectureComponent {
  id: string;
  name: string;
  type?: 'service' | 'database' | 'frontend' | 'backend';
}

export interface ArchitectureConnection {
  from: string;
  to: string;
  label?: string;
}

export function createArchitectureDiagram(
  components: ArchitectureComponent[],
  connections: ArchitectureConnection[]
): { elements: ExcalidrawElement[]; appState: any; files: any } {
  const elements: ExcalidrawElement[] = [];
  const componentPositions: { [key: string]: { x: number; y: number; width: number; height: number } } = {};

  // Layout components in a grid
  const cols = 3;
  const componentWidth = 180;
  const componentHeight = 100;
  const spacingX = 250;
  const spacingY = 200;
  const startX = 200;
  const startY = 150;

  components.forEach((component, index) => {
    const row = Math.floor(index / cols);
    const col = index % cols;
    const x = startX + col * spacingX;
    const y = startY + row * spacingY;

    // Color based on type
    const colors: { [key: string]: string } = {
      service: '#4c9aff',
      database: '#ff5630',
      frontend: '#00c875',
      backend: '#ffab00',
    };
    const color = colors[component.type || 'service'] || '#1e1e1e';

    const componentElements = createRectangle(x, y, componentWidth, componentHeight, component.name, color);
    elements.push(...componentElements);

    componentPositions[component.id] = { x, y, width: componentWidth, height: componentHeight };
  });

  // Create connections
  connections.forEach((conn) => {
    const fromPos = componentPositions[conn.from];
    const toPos = componentPositions[conn.to];

    if (fromPos && toPos) {
      const fromX = fromPos.x + fromPos.width / 2;
      const fromY = fromPos.y + fromPos.height / 2;
      const toX = toPos.x + toPos.width / 2;
      const toY = toPos.y + toPos.height / 2;

      const arrowElements = createArrow(fromX, fromY, toX, toY, conn.label);
      elements.push(...arrowElements);
    }
  });

  return {
    elements,
    appState: {
      viewBackgroundColor: '#ffffff',
      currentItemFontFamily: 1,
      gridSize: null,
    },
    files: {},
  };
}
