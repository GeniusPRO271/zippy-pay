import { BaseTransaction } from "@/lib/types/transaction"
import { IconCopy } from "@tabler/icons-react"
import { toast } from "sonner"

function RawJsonBlock({ json }: { json: BaseTransaction }) {
  const jsonText = JSON.stringify(json, null, 2) // pretty print with 2 spaces

  function CopyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      toast.success("Copied successfully!")
    }).catch(() => {
      toast.error("Failed to copy")
    })
  }

  return (
    <div className="flex pt-4 ">
      <div className="text-xs rounded-md border w-full max-w-[400px]">
        <div className="flex items-center justify-end border-b rounded-t p-1">
          <button
            onClick={() => CopyToClipboard(jsonText)}
            className="dark:hover:bg-gray-900 hover:bg-gray-100 p-1 rounded cursor-pointer"
          >
            <IconCopy size={14} />
          </button>
        </div>
        <pre className="p-4 text-wrap max-h-[500px] max-w-[349px] overflow-x-auto overflow-y-scroll">
          {jsonText}
        </pre>
      </div>
    </div>
  )
}

export default RawJsonBlock
