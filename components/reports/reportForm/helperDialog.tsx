import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { IconInfoCircle } from "@tabler/icons-react"
import React from "react"

export function HelperDialog() {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <Tooltip>
        <TooltipTrigger className="cursor-pointer" asChild onClick={() => { setIsOpen(true) }}>
          <IconInfoCircle size={18} className="text-gray-500" />
        </TooltipTrigger>
        <TooltipContent className="mb-1">
          <p>Help with formulas</p>
        </TooltipContent>
      </Tooltip>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>How formulas work</DialogTitle>
          <DialogDescription>
            In here you can find the available symbols, their meanings, and short examples of how to create formulas.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <div className="grid gap-2">
            <div className="font-semibold">Symbols</div>
            <div className="text-sm text-muted-foreground space-y-2">
              <div><b>+</b> — add values</div>
              <div><b>-</b> — subtract values</div>
              <div><b>*</b> — multiply values</div>
              <div><b>/</b> — divide values</div>
              <div><b>?</b> / <b>:</b> — conditional (if / else)</div>
              <div><b>Math.min(a, b)</b> — choose the smaller value</div>
              <div><b>Math.max(a, b)</b> — choose the larger value</div>
              <div><b>amount</b> — the base transaction amount</div>
            </div>
          </div>
          <div className="grid gap-2">
            <div className="font-semibold">Examples</div>
            <div className="text-sm text-muted-foreground space-y-2">
              <div><b>(amount * 0.05)</b> — calculates 5% of the amount</div>
              <div><b>(amount * 0.02) + 50</b> — adds a 2% fee plus 50</div>
              <div><b>amount {">"} 1000 ? (amount * 0.02) : (amount * 0.05)</b> — 2% if over 1000, otherwise 5%</div>
              <div><b>Math.min(amount * 0.03, 200)</b> — 3% fee capped at 200</div>
              <div><b>Math.max(amount * 0.02, 15)</b> — 2% fee with a minimum of 15</div>
            </div>
          </div>

        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog >
  )
}
