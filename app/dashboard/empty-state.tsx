"use client"

import { IconFolderCode, IconUpload } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { BaseTransaction } from "@/lib/types/transaction"

export function EmptyState({ setTransactionsAction, setIsLoadingAction }: {
  setTransactionsAction: React.Dispatch<React.SetStateAction<BaseTransaction[]>>, setIsLoadingAction: React.Dispatch<React.SetStateAction<boolean>>
}) {

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    setIsLoadingAction(true)
    const fileArray = Array.from(files)
    let completed = 0
    const imported: BaseTransaction[] = []

    fileArray.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const json = JSON.parse(e.target?.result as string)
          const data: BaseTransaction[] = Array.isArray(json) ? json : [json]
          imported.push(...data)
        } catch (err) {
          console.error(`[ERROR] Invalid JSON in file ${file.name}`, err)
        } finally {
          completed++
          // Only update state once when ALL files are read
          if (completed === fileArray.length) {
            setTransactionsAction(imported)
            setIsLoadingAction(false)
          }
        }
      }
      reader.readAsText(file)
    })
  }

  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <IconFolderCode />
        </EmptyMedia>
        <EmptyTitle>No Data Yet</EmptyTitle>
        <EmptyDescription>
          You haven&apos;t imported any merchants data yet. Get started by importing a
          your first project.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <div className="flex gap-2">
          <input
            type="file"
            accept=".json"
            id="file-input"
            multiple
            className="hidden"
            onChange={handleFileImport}
          />
          <Button className={"cursor-pointer"} onClick={() => document.getElementById("file-input")?.click()}>
            Import Data
            <IconUpload className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </EmptyContent>
      <Button
        variant="link"
        asChild
        className="text-muted-foreground"
        size="sm"
      >
      </Button>
    </Empty>
  )
}
