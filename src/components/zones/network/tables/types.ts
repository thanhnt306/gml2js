// Shared type definitions for Network data tables

export interface GisRow {
  issue: string
  description: string
  severity: 'CRITICAL' | 'IMPACTED' | ''
  related_obj_id?: string
}

export interface LinkRow {
  label: string
  start_node: string
  stop_node: string
  length: string | number
  diameter: string | number
  material: string
  status: string
}

export interface NodeRow {
  label: string
  elevation: string | number
  latitude: string | number
  longitude: string | number
  status: string
}

export interface AttributeOption {
  name: string
  selected: boolean
}

export interface AttributeGroup {
  label: string
  attributes: AttributeOption[]
}
