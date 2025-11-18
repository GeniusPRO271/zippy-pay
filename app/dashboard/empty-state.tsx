"use client"

import { IconFolderCode, IconUpload, IconDatabase } from "@tabler/icons-react"
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

export function EmptyState({
  setTransactionsAction,
  setIsLoadingAction,
}: {
  setTransactionsAction: React.Dispatch<React.SetStateAction<BaseTransaction[]>>
  setIsLoadingAction: React.Dispatch<React.SetStateAction<boolean>>
}) {

  // -------------------------
  // IMPORT FILES FROM USER
  // -------------------------
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
          if (completed === fileArray.length) {
            setTransactionsAction(imported)
            setIsLoadingAction(false)
          }
        }
      }
      reader.readAsText(file)
    })
  }

  // -------------------------
  // LOAD SAMPLE DATA
  // -------------------------
  const handleLoadSampleData = async () => {
    setIsLoadingAction(true)

    const allData: BaseTransaction[] = []
    let index = 1

    while (true) {
      const fileName = `/sample-data/sample-${index}.json`

      try {
        const res = await fetch(fileName)

        if (!res.ok) break // stop when 404

        const json = await res.json()
        const data: BaseTransaction[] = Array.isArray(json) ? json : [json]

        allData.push(...data)
        index++

      } catch (err) {
        console.error(`Failed to load ${fileName}`, err)
        break
      }
    }

    setTransactionsAction(allData)
    setIsLoadingAction(false)
  }

  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <IconFolderCode />
        </EmptyMedia>
        <EmptyTitle>No Data Yet</EmptyTitle>
        <EmptyDescription>
          You haven&apos;t imported any merchants data yet. Get started by importing your first project or load sample data.
        </EmptyDescription>
      </EmptyHeader>

      <EmptyContent>
        <div className="flex gap-2">
          {/* Hidden Input */}
          <input
            type="file"
            accept=".json"
            id="file-input"
            multiple
            className="hidden"
            onChange={handleFileImport}
          />

          {/* Import Button */}
          <Button onClick={() => document.getElementById("file-input")?.click()}>
            Import Data
            <IconUpload className="ml-2 h-4 w-4" />
          </Button>

          {/* Load Sample Data */}
          <Button variant="secondary" onClick={handleLoadSampleData}>
            Load Sample Data
            <IconDatabase className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </EmptyContent>
    </Empty>
  )
}
