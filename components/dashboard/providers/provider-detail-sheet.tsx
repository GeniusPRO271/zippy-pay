"use client"

import * as React from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { IconPencil, IconCheck, IconX } from "@tabler/icons-react"
import { Provider } from "@/lib/types/provider"
import { useUpdateProvider } from "@/hooks/provider/useUpdateProvider"
import { useAuth } from "@/context/auth"
import { format } from "date-fns"

interface ProviderDetailSheetProps {
  provider: Provider | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const STATUS_VARIANT: Record<Provider["status"], "default" | "destructive" | "outline"> = {
  active: "default",
  inactive: "outline",
  maintenance: "outline",
}

const STATUS_CLASS: Record<Provider["status"], string> = {
  active: "bg-emerald-600 text-white hover:bg-emerald-600",
  inactive: "border-yellow-500 text-yellow-600",
  maintenance: "border-orange-500 text-orange-600",
}

const CATEGORY_CLASS: Record<Provider["category"], string> = {
  PSP: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  BANK: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  AGGREGATOR: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  WALLET: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  CRYPTO_GATEWAY: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200",
}

const STATUSES: Provider["status"][] = ["active", "inactive", "maintenance"]
const CATEGORIES: Provider["category"][] = [
  "PSP",
  "BANK",
  "AGGREGATOR",
  "WALLET",
  "CRYPTO_GATEWAY",
]

type EditingField = "name" | "status" | "category" | "headquartersCountry" | "priority" | "logoUrl" | null

function formatDate(date: Date | string | null): string {
  if (!date) return "—"
  try {
    return format(new Date(date), "dd/MM/yyyy HH:mm")
  } catch {
    return "—"
  }
}

export function ProviderDetailSheet({
  provider,
  open,
  onOpenChange,
}: ProviderDetailSheetProps) {
  const { auth } = useAuth()
  const isSuperAdmin = auth.role === "superadmin"

  const [editingField, setEditingField] = React.useState<EditingField>(null)
  const [editValue, setEditValue] = React.useState("")
  const updateProvider = useUpdateProvider()

  React.useEffect(() => {
    if (!open) {
      setEditingField(null)
      setEditValue("")
    }
  }, [open])

  if (!provider) return null

  function startEdit(field: NonNullable<EditingField>, currentValue: string) {
    setEditingField(field)
    setEditValue(currentValue)
  }

  function cancelEdit() {
    setEditingField(null)
    setEditValue("")
  }

  function saveEdit(field: NonNullable<EditingField>) {
    if (!provider) return

    const trimmed = editValue.trim()

    // For name, don't allow empty
    if (field === "name" && !trimmed) {
      cancelEdit()
      return
    }

    // Skip if value unchanged
    const currentValue = String(provider[field] ?? "")
    if (trimmed === currentValue) {
      cancelEdit()
      return
    }

    let data: Record<string, string | number | null> = {}

    if (field === "priority") {
      const num = parseInt(trimmed, 10)
      data = { priority: Number.isNaN(num) ? null : num }
    } else if (field === "headquartersCountry" || field === "logoUrl") {
      data = { [field]: trimmed || null }
    } else {
      data = { [field]: trimmed }
    }

    updateProvider.mutate(
      { id: provider.id, data },
      { onSuccess: () => cancelEdit() }
    )
  }

  function handleKeyDown(e: React.KeyboardEvent, field: NonNullable<EditingField>) {
    if (e.key === "Enter") saveEdit(field)
    if (e.key === "Escape") cancelEdit()
    e.stopPropagation()
  }

  function EditButton({ field, currentValue }: { field: NonNullable<EditingField>; currentValue: string }) {
    if (!isSuperAdmin) return null
    return (
      <Button
        size="icon"
        variant="ghost"
        className="h-6 w-6 shrink-0"
        onClick={() => startEdit(field, currentValue)}
      >
        <IconPencil size={12} />
      </Button>
    )
  }

  function SaveCancelButtons({ field }: { field: NonNullable<EditingField> }) {
    return (
      <>
        <Button
          size="icon"
          variant="ghost"
          className="h-6 w-6 shrink-0"
          onClick={() => saveEdit(field)}
          disabled={updateProvider.isPending}
        >
          <IconCheck size={14} />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="h-6 w-6 shrink-0"
          onClick={cancelEdit}
        >
          <IconX size={14} />
        </Button>
      </>
    )
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            {editingField === "name" ? (
              <div className="flex items-center gap-2 flex-1">
                <Input
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, "name")}
                  className="h-8"
                  autoFocus
                />
                <SaveCancelButtons field="name" />
              </div>
            ) : (
              <>
                <span className="text-xl font-semibold">{provider.name}</span>
                <EditButton field="name" currentValue={provider.name} />
              </>
            )}
          </SheetTitle>
          <SheetDescription>
            Provider details and configuration
          </SheetDescription>
        </SheetHeader>

        <div className="px-4 space-y-6">
          {/* General Information */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              General Information
            </h4>
            <div className="grid grid-cols-[120px_1fr] gap-y-3 gap-x-4 text-sm">
              {/* Status */}
              <span className="text-muted-foreground">Status</span>
              <div className="flex items-center gap-2">
                {editingField === "status" ? (
                  <div className="flex items-center gap-2">
                    <Select value={editValue} onValueChange={setEditValue}>
                      <SelectTrigger className="h-8 w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUSES.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s.charAt(0).toUpperCase() + s.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <SaveCancelButtons field="status" />
                  </div>
                ) : (
                  <>
                    <Badge
                      variant={STATUS_VARIANT[provider.status]}
                      className={STATUS_CLASS[provider.status]}
                    >
                      {provider.status.charAt(0).toUpperCase() + provider.status.slice(1)}
                    </Badge>
                    <EditButton field="status" currentValue={provider.status} />
                  </>
                )}
              </div>

              {/* Category */}
              <span className="text-muted-foreground">Category</span>
              <div className="flex items-center gap-2">
                {editingField === "category" ? (
                  <div className="flex items-center gap-2">
                    <Select value={editValue} onValueChange={setEditValue}>
                      <SelectTrigger className="h-8 w-[180px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <SaveCancelButtons field="category" />
                  </div>
                ) : (
                  <>
                    <Badge variant="outline" className={CATEGORY_CLASS[provider.category]}>
                      {provider.category}
                    </Badge>
                    <EditButton field="category" currentValue={provider.category} />
                  </>
                )}
              </div>

              {/* HQ Country */}
              <span className="text-muted-foreground">HQ Country</span>
              <div className="flex items-center gap-2">
                {editingField === "headquartersCountry" ? (
                  <div className="flex items-center gap-2 flex-1">
                    <Input
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, "headquartersCountry")}
                      className="h-8"
                      autoFocus
                    />
                    <SaveCancelButtons field="headquartersCountry" />
                  </div>
                ) : (
                  <>
                    <span>{provider.headquartersCountry ?? "—"}</span>
                    <EditButton
                      field="headquartersCountry"
                      currentValue={provider.headquartersCountry ?? ""}
                    />
                  </>
                )}
              </div>

              {/* Priority */}
              <span className="text-muted-foreground">Priority</span>
              <div className="flex items-center gap-2">
                {editingField === "priority" ? (
                  <div className="flex items-center gap-2 flex-1">
                    <Input
                      type="number"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, "priority")}
                      className="h-8 w-24"
                      autoFocus
                    />
                    <SaveCancelButtons field="priority" />
                  </div>
                ) : (
                  <>
                    <span>{provider.priority ?? "—"}</span>
                    <EditButton
                      field="priority"
                      currentValue={String(provider.priority ?? "")}
                    />
                  </>
                )}
              </div>

              {/* Logo URL */}
              <span className="text-muted-foreground">Logo URL</span>
              <div className="flex items-center gap-2">
                {editingField === "logoUrl" ? (
                  <div className="flex items-center gap-2 flex-1">
                    <Input
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, "logoUrl")}
                      className="h-8"
                      placeholder="https://..."
                      autoFocus
                    />
                    <SaveCancelButtons field="logoUrl" />
                  </div>
                ) : (
                  <>
                    <span className="truncate max-w-[250px]">
                      {provider.logoUrl ?? "—"}
                    </span>
                    <EditButton
                      field="logoUrl"
                      currentValue={provider.logoUrl ?? ""}
                    />
                  </>
                )}
              </div>

              {/* Created */}
              <span className="text-muted-foreground">Created</span>
              <span>{formatDate(provider.createdAt)}</span>

              {/* Updated */}
              <span className="text-muted-foreground">Updated</span>
              <span>{formatDate(provider.updatedAt)}</span>
            </div>
          </div>

          <Separator />
        </div>
      </SheetContent>
    </Sheet>
  )
}
