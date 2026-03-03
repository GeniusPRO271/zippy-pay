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
import { Separator } from "@/components/ui/separator"
import { IconPencil, IconCheck, IconX } from "@tabler/icons-react"
import { Merchant } from "@/lib/types/merchant"
import { useMerchantFinanceOptions } from "@/hooks/merchant/useMerchantFinanceOptions"
import { useUpdateMerchant } from "@/hooks/merchant/useUpdateMerchant"
import { format } from "date-fns"

interface MerchantDetailSheetProps {
  merchant: Merchant | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const STATUS_VARIANT: Record<Merchant["status"], "default" | "destructive" | "outline"> = {
  active: "default",
  inactive: "outline",
  suspended: "destructive",
}

const STATUS_CLASS: Record<Merchant["status"], string> = {
  active: "bg-emerald-600 text-white hover:bg-emerald-600",
  inactive: "border-yellow-500 text-yellow-600",
  suspended: "",
}

function formatDate(date: Date | string | null): string {
  if (!date) return "—"
  try {
    return format(new Date(date), "dd/MM/yyyy HH:mm")
  } catch {
    return "—"
  }
}

export function MerchantDetailSheet({
  merchant,
  open,
  onOpenChange,
}: MerchantDetailSheetProps) {
  const [isEditing, setIsEditing] = React.useState(false)
  const [editName, setEditName] = React.useState("")
  const updateMerchant = useUpdateMerchant()

  const { data: financeOptions, isLoading: financeLoading } =
    useMerchantFinanceOptions(merchant?.id ?? "")

  React.useEffect(() => {
    if (!open) {
      setIsEditing(false)
    }
  }, [open])

  if (!merchant) return null

  const handleStartEdit = () => {
    setEditName(merchant.name)
    setIsEditing(true)
  }

  const handleSave = () => {
    if (!editName.trim() || editName.trim() === merchant.name) {
      setIsEditing(false)
      return
    }
    updateMerchant.mutate(
      { id: merchant.id, data: { name: editName.trim() } },
      {
        onSuccess: () => setIsEditing(false),
      }
    )
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditName("")
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            {isEditing ? (
              <div className="flex items-center gap-2 flex-1">
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSave()
                    if (e.key === "Escape") handleCancel()
                    e.stopPropagation()
                  }}
                  className="h-8"
                  autoFocus
                />
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 shrink-0"
                  onClick={handleSave}
                  disabled={updateMerchant.isPending}
                >
                  <IconCheck size={16} />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 shrink-0"
                  onClick={handleCancel}
                >
                  <IconX size={16} />
                </Button>
              </div>
            ) : (
              <>
                <span className="text-xl font-semibold">{merchant.name}</span>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7"
                  onClick={handleStartEdit}
                >
                  <IconPencil size={14} />
                </Button>
              </>
            )}
          </SheetTitle>
          <SheetDescription>
            Merchant details and connected operations
          </SheetDescription>
        </SheetHeader>

        <div className="px-4 space-y-6">
          {/* Basic Info */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              General Information
            </h4>
            <div className="grid grid-cols-[120px_1fr] gap-y-2 gap-x-4 text-sm">
              <span className="text-muted-foreground">Status</span>
              <span>
                <Badge
                  variant={STATUS_VARIANT[merchant.status]}
                  className={STATUS_CLASS[merchant.status]}
                >
                  {merchant.status.charAt(0).toUpperCase() + merchant.status.slice(1)}
                </Badge>
              </span>

              <span className="text-muted-foreground">Email</span>
              <span>{merchant.email ?? "—"}</span>

              <span className="text-muted-foreground">Website</span>
              <span>{merchant.website ?? "—"}</span>

              <span className="text-muted-foreground">Contact Person</span>
              <span>{merchant.contactPerson ?? "—"}</span>

              <span className="text-muted-foreground">Active</span>
              <span>{merchant.isActive ? "Yes" : "No"}</span>

              <span className="text-muted-foreground">Created</span>
              <span>{formatDate(merchant.createdAt)}</span>

              <span className="text-muted-foreground">Updated</span>
              <span>{formatDate(merchant.updatedAt)}</span>
            </div>
          </div>

          <Separator />

          {/* Connected Operations */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Connected Operations
            </h4>
            {financeLoading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : financeOptions?.countries.length ? (
              <div className="space-y-4">
                {financeOptions.countries.map((country) => (
                  <div key={country.countryId} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{country.countryIsoCode}</Badge>
                      <span className="text-sm font-medium">{country.countryName}</span>
                    </div>
                    <div className="ml-4 space-y-2">
                      {country.providers.map((provider) => (
                        <div key={provider.providerId} className="space-y-1">
                          <span className="text-sm text-muted-foreground">
                            {provider.providerName}
                          </span>
                          <div className="flex flex-wrap gap-1 ml-2">
                            {provider.payMethods.map((pm) => (
                              <Badge
                                key={pm.payMethodId}
                                variant="secondary"
                                className="text-xs"
                              >
                                {pm.payMethodName}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No connected operations found.
              </p>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
