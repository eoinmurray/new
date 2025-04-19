"use client"

import { useEffect, useState } from "react"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"

type SliderConfig = {
  type: "slider"
  id: string
  label: string
  defaultValue: number
  min: number
  max: number
  step?: number
}

type SwitchConfig = {
  type: "switch"
  id: string
  label: string
  defaultValue: boolean
}

type SelectConfig = {
  type: "select"
  id: string
  label: string
  defaultValue: string
  options: { label: string; value: string }[]
}

type ControlConfig = SliderConfig | SwitchConfig | SelectConfig

type SimulationControlsProps = {
  inputs: ControlConfig[]
  onChange?: (values: Record<string, number | boolean | string>) => void
}

export default function SimulationControls({ inputs, onChange }: SimulationControlsProps) {
  // Initialize state from inputs config
  const initialValues = inputs.reduce((acc, input) => {
    acc[input.id] = input.defaultValue
    return acc
  }, {} as Record<string, number | boolean | string>)

  const [values, setValues] = useState<Record<string, number | boolean | string>>(initialValues)

  // Notify parent on any change
  useEffect(() => {
    onChange?.(values)
  }, [values, onChange])

  const handleSliderChange = (id: string, newVal: number) => {
    setValues(prev => ({ ...prev, [id]: newVal }))
  }

  const handleSwitchChange = (id: string, checked: boolean) => {
    setValues(prev => ({ ...prev, [id]: checked }))
  }

  const handleSelectChange = (id: string, value: string) => {
    setValues(prev => ({ ...prev, [id]: value }))
  }

  const reset = () => {
    setValues(initialValues)
  }

  return (
    <div className="p-3 border border-border rounded-lg bg-[#FAFAFA] max-w-xs">
      <h2 className="text-base font-medium text-[#333333] mb-3">Simulation Parameters</h2>
      {inputs.map(input => (
        <div key={input.id} className="space-y-1 w-full">
          {input.type === "slider" ? (
            <>
              <Label htmlFor={input.id} className="flex justify-between text-sm">
                <span className="text-[#555555]">{input.label}</span>
                <span className="px-1 py-0.5 rounded bg-[#EEEEEE] font-mono text-xs text-[#555555]">
                  {(() => {
                    const val = values[input.id] as number;
                    const step = (input as SliderConfig).step ?? 1;
                    return val.toFixed(step < 1 ? 2 : 0);
                  })()}
                </span>
              </Label>
              <Slider
                id={input.id}
                min={(input as SliderConfig).min}
                max={(input as SliderConfig).max}
                step={(input as SliderConfig).step ?? 1}
                value={[values[input.id] as number]}
                onValueChange={([val]) => handleSliderChange(input.id, val)}
                className="my-1 w-40"
              />
            </>
          ) : input.type === "switch" ? (
            <div className="flex items-center justify-between py-1">
              <Label htmlFor={input.id} className="text-sm text-[#555555]">
                {input.label}
              </Label>
              <Switch
                id={input.id}
                checked={values[input.id] as boolean}
                onCheckedChange={checked => handleSwitchChange(input.id, checked)}
              />
            </div>
          ) : (
            <div className="space-y-0">
              <Label htmlFor={input.id} className="text-sm text-[#555555]">
                {input.label}
              </Label>
              <Select
                value={values[input.id] as string}
                onValueChange={val => handleSelectChange(input.id, val)}
              >
                <SelectTrigger className="w-40 py-1">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {(input as SelectConfig).options.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      ))}

      <Button
        variant="outline"
        size="sm"
        onClick={reset}
        className="mt-4 text-[#555555] border-[#999999] hover:bg-[#EEEEEE] w-auto"
      >
        Reset
      </Button>
    </div>
  )
}
