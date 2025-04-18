"use client"

import { useEffect, useState } from "react"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"

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

type ControlConfig = SliderConfig | SwitchConfig

type SimulationControlsProps = {
  inputs: ControlConfig[]
  onChange?: (values: Record<string, number | boolean>) => void
}

export default function SimulationControls({ inputs, onChange }: SimulationControlsProps) {
  // Initialize state from inputs config
  const initialValues = inputs.reduce((acc, input) => {
    acc[input.id] = input.defaultValue
    return acc
  }, {} as Record<string, number | boolean>)

  const [values, setValues] = useState<Record<string, number | boolean>>(initialValues)

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

  const reset = () => {
    setValues(initialValues)
  }

  return (
    <div className="p-4 border border-border rounded-lg bg-[#FAFAFA] space-y-6">
      <h2 className="text-lg font-medium text-[#333333] mb-4">Simulation Parameters</h2>
      {inputs.map(input => (
        <div key={input.id} className="space-y-2">
          {input.type === "slider" ? (
            <>
              <Label htmlFor={input.id} className="flex justify-between text-sm">
                <span className="text-[#555555]">{input.label}</span>
                <span className="px-2 py-0.5 rounded bg-[#EEEEEE] font-mono text-xs text-[#555555]">
                  {/* Display with decimal places if step < 1 */}
                  {(values[input.id] as number).toFixed(
                    (input as SliderConfig).step && (input as SliderConfig).step < 1 ? 2 : 0
                  )}
                </span>
              </Label>
              <Slider
                id={input.id}
                min={(input as SliderConfig).min}
                max={(input as SliderConfig).max}
                step={(input as SliderConfig).step ?? 1}
                value={[values[input.id] as number]}
                onValueChange={([val]) => handleSliderChange(input.id, val)}
                className="my-2"
              />
            </>
          ) : (
            <div className="flex items-center justify-between py-1">
              <Label htmlFor={input.id} className="text-sm text-[#555555]">{input.label}</Label>
              <Switch
                id={input.id}
                checked={values[input.id] as boolean}
                onCheckedChange={checked => handleSwitchChange(input.id, checked)}
              />
            </div>
          )}
        </div>
      ))}

      <Button 
        variant="outline" 
        size="sm" 
        onClick={reset} 
        className="w-full mt-4 text-[#555555] border-[#999999] hover:bg-[#EEEEEE]"
      >
        Reset Parameters
      </Button>
    </div>
  )
}
