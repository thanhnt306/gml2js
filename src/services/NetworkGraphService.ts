/**
 * NetworkGraphService
 *
 * Parses the real GeoJSON response returned by the gis-service /save-roles endpoint
 * and converts it into the NetworkGraphData format consumed by useNetworkMap.
 *
 * Backend response shape:
 * {
 *   success: boolean,
 *   network: {
 *     nodes: GeoJSON FeatureCollection (Points),
 *     pipes: GeoJSON FeatureCollection (LineStrings),
 *     issues: GisIssue[],
 *   }
 * }
 */
import type { GisRow, LinkRow, NodeRow, AttributeGroup } from '@/components/zones/network/tables/types'
export type { GisRow, LinkRow, NodeRow, AttributeGroup }

export interface NetworkNode {
  label: string
  elev_m: number
  x: number   // longitude (WGS84)
  y: number   // latitude  (WGS84)
  /** Normalised lowercase type string: 'junction' | 'meter' | 'valve' | 'pump' | 'tank' | 'reservoir' | 'inlet' */
  node_type: string
  status: string
  dma_id: number
  valve_type: string
  valve_size: number
  pump_model: string
  /** All raw attributes from getAttributes() */
  raw: Record<string, unknown>
}

export interface NetworkPipe {
  label: string
  start_node: string
  stop_node: string
  length_m: number
  d_mm: number
  material: string
  status: string
  dma_id: number
  valve_type: string
  valve_size: number
  pump_model: string
  /** GeoJSON coordinates [[lon,lat], ...] – may contain intermediate vertices */
  path: [number, number][]
  /** All raw attributes from getAttributes() */
  raw: Record<string, unknown>
}

export interface NetworkExtent {
  xmin: number; ymin: number
  xmax: number; ymax: number
}

export interface GisIssue {
  id: string
  name: string
  level: string
  description: string
  relatedObjectIds: {
    junctionIds: string[]
    pipelineIds: string[]
  }
}

export interface NetworkGraphData {
  nodes: NetworkNode[]
  pipes: NetworkPipe[]
  extent: NetworkExtent
  issues: GisIssue[]
  exportGroups: AttributeGroup[]
}

// ─────────────────────────────────────────────────────────────────────────────
// Node-type normalisation
// Backend stores types like "Junction", "Meter", "Valve", etc. (capital).
// useNetworkMap expects lowercase keys.
// ─────────────────────────────────────────────────────────────────────────────
const NODE_TYPE_MAP: Record<string, NetworkNode['node_type']> = {
  junction: 'junction',
  meter: 'meter',
  valve: 'valve',
  pump: 'pump',
  tank: 'tank',
  reservoir: 'reservoir',
  inlet: 'inlet',
}

export function normaliseNodeType(raw: string | undefined): string {
  if (!raw) return 'junction'
  const lower = raw.toLowerCase().trim()
  
  if (lower === 'u' || lower === 'junction') return 'junction'
  if (lower === 'e' || lower === 'meter') return 'meter'
  if (lower === 'v' || lower === 'valve') return 'valve'
  if (lower === 'p' || lower === 'pump') return 'pump'
  if (lower === 't' || lower === 'tank') return 'tank'
  if (lower === 'r' || lower === 'reservoir') return 'reservoir'
  if (lower === 'l' || lower === 'logger') return 'junction' // map logger to junction
  if (lower === 'inlet') return 'inlet'

  return NODE_TYPE_MAP[lower] ?? 'junction'
}

// ─────────────────────────────────────────────────────────────────────────────
// Parser: GeoJSON FeatureCollection → domain objects
// ─────────────────────────────────────────────────────────────────────────────

function parseNodesFC(fc: any, dmaId: number): NetworkNode[] {
  if (!fc || fc.type !== 'FeatureCollection') return []
  const nodes: NetworkNode[] = []

  for (const feature of fc.features ?? []) {
    const props = feature.properties ?? {}
    const coords = feature.geometry?.coordinates as [number, number] | undefined
    if (!coords) continue

    const [lon, lat] = coords
    nodes.push({
      label: String(props['LABEL'] ?? props['label'] ?? ''),
      elev_m: Number(props['ELEVATION (m)'] ?? props['elevation'] ?? 0),
      x: lon,
      y: lat,
      node_type: normaliseNodeType(
        String(props['NODE_TYPE'] ?? props['node_type'] ?? 'junction')
      ),
      status: String(props['STATUS'] ?? props['status'] ?? ''),
      dma_id: dmaId,
      valve_type: String(props['VALVE_TYPE'] ?? props['valve_type'] ?? ''),
      valve_size: Number(props['VALVE_SIZE'] ?? props['valve_size'] ?? 0),
      pump_model: String(props['PUMP_MODEL'] ?? props['pump_model'] ?? ''),
      raw: props,
    })
  }
  return nodes
}

function parsePipesFC(fc: any, dmaId: number): NetworkPipe[] {
  if (!fc || fc.type !== 'FeatureCollection') return []
  const pipes: NetworkPipe[] = []

  for (const feature of fc.features ?? []) {
    const props = feature.properties ?? {}
    const coords = (feature.geometry?.coordinates ?? []) as [number, number][]

    pipes.push({
      label: String(props['LABEL'] ?? props['label'] ?? ''),
      start_node: String(props['START_NODE'] ?? props['start_node'] ?? ''),
      stop_node: String(props['STOP_NODE'] ?? props['stop_node'] ?? ''),
      length_m: Number(props['LENGTH (m)'] ?? props['length_m'] ?? 0),
      d_mm: Number(props['DIAMETER (mm)'] ?? props['d_mm'] ?? 0),
      material: String(props['MATERIAL'] ?? props['material'] ?? ''),
      status: String(props['STATUS'] ?? props['status'] ?? ''),
      dma_id: dmaId,
      valve_type: String(props['VALVE_TYPE'] ?? props['valve_type'] ?? ''),
      valve_size: Number(props['VALVE_SIZE'] ?? props['valve_size'] ?? 0),
      pump_model: String(props['PUMP_MODEL'] ?? props['pump_model'] ?? ''),
      path: coords,
      raw: props,
    })
  }
  return pipes
}

function computeExtent(nodes: NetworkNode[], pipes: NetworkPipe[]): NetworkExtent {
  const xs: number[] = []
  const ys: number[] = []

  for (const n of nodes) { xs.push(n.x); ys.push(n.y) }
  for (const p of pipes) {
    for (const [lon, lat] of p.path) { xs.push(lon); ys.push(lat) }
  }

  if (xs.length === 0) return { xmin: 0, ymin: 0, xmax: 0, ymax: 0 }

  const pad = 0.002
  return {
    xmin: Math.min(...xs) - pad,
    ymin: Math.min(...ys) - pad,
    xmax: Math.max(...xs) + pad,
    ymax: Math.max(...ys) + pad,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Public parser — called by AddNetworkFiles after a successful save-roles call
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Converts the raw `network` object from the /save-roles API response
 * into a fully typed NetworkGraphData object.
 *
 * @param rawNetwork  - The `response.network` field from /save-roles
 * @param dmaId       - The zone/DMA ID (numeric)
 */
export function parseNetworkResponse(rawNetwork: any, dmaId: number): NetworkGraphData {
  const nodes = parseNodesFC(rawNetwork?.nodes, dmaId)
  const pipes = parsePipesFC(rawNetwork?.pipes, dmaId)
  const extent = computeExtent(nodes, pipes)
  const issues: GisIssue[] = (rawNetwork?.issues ?? []).map((iss: any) => ({
    id: String(iss.id ?? ''),
    name: String(iss.name ?? iss.level ?? ''),
    level: String(iss.level ?? ''),
    description: String(iss.description ?? ''),
    relatedObjectIds: {
      junctionIds: Array.isArray(iss.relatedObjectIds?.junctionIds) ? iss.relatedObjectIds.junctionIds.map(String) : [],
      pipelineIds: Array.isArray(iss.relatedObjectIds?.pipelineIds) ? iss.relatedObjectIds.pipelineIds.map(String) : [],
    },
  }))

  const exportGroups: AttributeGroup[] = []
  const options = rawNetwork?.export_options || {}
  const mapKeyToLabel: Record<string, string> = {
    'MainPipe': 'Main Pipe',
    'LateralPipe': 'Lateral Pipe',
    'Meter': 'Meter',
    'Logger': 'Logger',
    'Valve': 'Valve',
    'Pump': 'Pump',
    'Tank': 'Tank'
  }

  for (const [backendKey, label] of Object.entries(mapKeyToLabel)) {
    const attrObj = options[backendKey] || {}
    const attributes = []
    for (const attrName of Object.keys(attrObj)) {
      attributes.push({ name: attrName, selected: true })
    }
    exportGroups.push({ label, attributes })
  }

  console.log(
    `[NetworkGraphService] Parsed ${nodes.length} nodes, ${pipes.length} pipes,`,
    `${issues.length} issues, ${exportGroups.length} export groups from API response`
  )

  return { nodes, pipes, extent, issues, exportGroups }
}
// ─────────────────────────────────────────────────────────────────────────────
// Converters: NetworkGraphData → table rows
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Maps GisIssue[] to GisRow[] for the Overview/Issues table.
 * Maps "CRITICAL" and "WARNING"/"IMPACTED" level strings to the
 * severity badge expected by GisDataTable.
 */
export function toGisRows(issues: GisIssue[]): GisRow[] {
  return issues.map(iss => {
    const levelUpper = iss.level.toUpperCase()
    let severity: GisRow['severity'] = ''
    if (levelUpper === 'CRITICAL' || levelUpper === 'ERROR') severity = 'CRITICAL'
    else if (levelUpper === 'WARNING' || levelUpper === 'IMPACTED') severity = 'IMPACTED'

    return {
      issue: iss.name || iss.level,
      description: iss.description,
      severity,
      related_obj_id: iss.id,
      related_junction_ids: iss.relatedObjectIds.junctionIds,
      related_pipeline_ids: iss.relatedObjectIds.pipelineIds,
    }
  })
}

/**
 * Maps NetworkPipe[] to LinkRow[] for the Link table.
 * Falls back to raw attributes for missing fields.
 */
export function toLinkRows(pipes: NetworkPipe[]): LinkRow[] {
  return pipes.map(pipe => ({
    label: pipe.label,
    start_node: pipe.start_node,
    stop_node: pipe.stop_node,
    length: pipe.length_m ?? pipe.raw['LENGTH (m)'] ?? 0,
    diameter: pipe.d_mm ?? pipe.raw['DIAMETER (mm)'] ?? 0,
    material: pipe.material || String(pipe.raw['MATERIAL'] ?? ''),
    status: pipe.status || 'Unknown',
  }))
}

/**
 * Maps NetworkNode[] to NodeRow[] for the Node table.
 * Falls back to raw attributes for missing fields.
 */
export function toNodeRows(nodes: NetworkNode[]): NodeRow[] {
  return nodes.map(node => ({
    label: node.label,
    elevation: node.elev_m,
    latitude: Number(node.y.toFixed(6)),
    longitude: Number(node.x.toFixed(6)),
    status: node.status || 'Unknown',
  }))
}
