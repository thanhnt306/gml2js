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

// ─────────────────────────────────────────────────────────────────────────────
// Domain types consumed by useNetworkMap
// ─────────────────────────────────────────────────────────────────────────────

export interface NetworkNode {
  label:     string
  elev_m:    number
  x:         number   // longitude (WGS84)
  y:         number   // latitude  (WGS84)
  /** Normalised lowercase type string: 'junction' | 'meter' | 'valve' | 'pump' | 'tank' | 'reservoir' | 'inlet' */
  node_type: string
  dma_id:    number
  /** All raw attributes from getAttributes() */
  raw: Record<string, unknown>
}

export interface NetworkPipe {
  label:      string
  start_node: string
  stop_node:  string
  length_m:   number
  d_mm:       number
  material:   string
  dma_id:     number
  /** GeoJSON coordinates [[lon,lat], ...] – may contain intermediate vertices */
  path:       [number, number][]
  /** All raw attributes from getAttributes() */
  raw: Record<string, unknown>
}

export interface NetworkExtent {
  xmin: number; ymin: number
  xmax: number; ymax: number
}

export interface GisIssue {
  id:          string
  level:       string
  description: string
}

export interface NetworkGraphData {
  nodes:  NetworkNode[]
  pipes:  NetworkPipe[]
  extent: NetworkExtent
  issues: GisIssue[]
}

// ─────────────────────────────────────────────────────────────────────────────
// Node-type normalisation
// Backend stores types like "Junction", "Meter", "Valve", etc. (capital).
// useNetworkMap expects lowercase keys.
// ─────────────────────────────────────────────────────────────────────────────
const NODE_TYPE_MAP: Record<string, NetworkNode['node_type']> = {
  junction:   'junction',
  meter:      'meter',
  valve:      'valve',
  pump:       'pump',
  tank:       'tank',
  reservoir:  'reservoir',
  inlet:      'inlet',
}

function normaliseNodeType(raw: string | undefined): string {
  if (!raw) return 'junction'
  const lower = raw.toLowerCase()
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
      label:     String(props['LABEL'] ?? props['label'] ?? ''),
      elev_m:    Number(props['ELEVATION (m)'] ?? props['elevation'] ?? 0),
      x:         lon,
      y:         lat,
      node_type: normaliseNodeType(
        String(props['NODE_TYPE'] ?? props['node_type'] ?? 'junction')
      ),
      dma_id:    dmaId,
      raw:       props,
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
      label:      String(props['LABEL'] ?? props['label'] ?? ''),
      start_node: String(props['START_NODE'] ?? props['start_node'] ?? ''),
      stop_node:  String(props['STOP_NODE']  ?? props['stop_node']  ?? ''),
      length_m:   Number(props['LENGTH (m)'] ?? props['length_m']   ?? 0),
      d_mm:       Number(props['DIAMETER (mm)'] ?? props['d_mm']    ?? 0),
      material:   String(props['MATERIAL'] ?? props['material']      ?? ''),
      dma_id:     dmaId,
      path:       coords,
      raw:        props,
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
  const nodes  = parseNodesFC(rawNetwork?.nodes, dmaId)
  const pipes  = parsePipesFC(rawNetwork?.pipes, dmaId)
  const extent = computeExtent(nodes, pipes)
  const issues: GisIssue[] = (rawNetwork?.issues ?? []).map((iss: any) => ({
    id:          String(iss.id          ?? ''),
    level:       String(iss.level       ?? ''),
    description: String(iss.description ?? ''),
  }))

  console.log(
    `[NetworkGraphService] Parsed ${nodes.length} nodes, ${pipes.length} pipes,`,
    `${issues.length} issues from API response`
  )

  return { nodes, pipes, extent, issues }
}
