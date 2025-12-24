"use client"

import { useState, useEffect } from "react"
import { Bug, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { getApiLogs, clearApiLogs, type ApiLog, getApiLogFromLocal } from "@/lib/api-logger"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export function ApiLoggerViewer() {
  const [isOpen, setIsOpen] = useState(false)
  const [logs, setLogs] = useState<ApiLog[]>([])
  const [openAccordion, setOpenAccordion] = useState<string>("")

  const refreshLogs = async () => {
    const apiLogs = await getApiLogs()
    console.log(JSON.stringify(apiLogs))
    setLogs(apiLogs)
  }

  const handleClear = async () => {
    await clearApiLogs()
    setLogs([])
    setOpenAccordion("")
  }

  useEffect(() => {
    if (isOpen) {
      refreshLogs()
      // Refresh logs every 2 seconds when panel is open
      const interval = setInterval(refreshLogs, 2000)
      return () => clearInterval(interval)
    }
  }, [isOpen])

  useEffect(() =>{
    getApiLogFromLocal()
  }, [])

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return "bg-green-500/10 text-green-600 dark:text-green-400"
    if (status >= 400 && status < 500) return "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
    if (status >= 500) return "bg-red-500/10 text-red-600 dark:text-red-400"
    return "bg-gray-500/10 text-gray-600 dark:text-gray-400"
  }

  const getMethodColor = (method: string) => {
    switch (method) {
      case "GET":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400"
      case "POST":
        return "bg-green-500/10 text-green-600 dark:text-green-400"
      case "PUT":
        return "bg-orange-500/10 text-orange-600 dark:text-orange-400"
      case "DELETE":
        return "bg-red-500/10 text-red-600 dark:text-red-400"
      default:
        return "bg-gray-500/10 text-gray-600 dark:text-gray-400"
    }
  }

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        size="icon"
        className="fixed bottom-4 right-4 h-12 w-12 rounded-full shadow-lg bg-transparent z-50"
        onClick={() => setIsOpen(true)}
      >
        <Bug className="h-5 w-5" />
      </Button>
    )
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setIsOpen(false)} />

      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-[1400px] h-[85vh] bg-background border rounded-lg shadow-xl flex flex-col z-50">
        <div className="flex items-center justify-between p-4 border-b flex-shrink-0">
          <div className="flex items-center gap-2">
            <Bug className="h-5 w-5" />
            <h3 className="font-semibold">API Call Logs</h3>
            <Badge variant="secondary">{logs.length}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleClear}>
              Clear
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-4">
            {logs.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No API calls logged yet</p>
            ) : (
              <Accordion type="single" collapsible value={openAccordion} onValueChange={setOpenAccordion} className='w-full'>
                {logs.map((log) => (
                  <AccordionItem key={log.id} value={log.id} className="border rounded-lg mb-2">
                    <AccordionTrigger className="px-3 py-2 hover:no-underline">
                      <div className="flex items-center gap-2 w-full">
                        <Badge className={`${getMethodColor(log.method)} flex-shrink-0`}>{log.method}</Badge>
                        <Badge className={`${getStatusColor(log.status)} flex-shrink-0`}>{log.status}</Badge>
                        <span className="text-xs text-muted-foreground flex-shrink-0">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                        <span className="text-sm truncate flex-1 text-left">{log.url}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="px-3 pb-3">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          {log.requestBody && (
                            <div>
                              <p className="text-xs font-semibold mb-2 text-blue-600 dark:text-blue-400">
                                Request Body:
                              </p>
                              <ScrollArea className="h-[400px] w-full rounded border bg-muted/30">
                                <pre className="text-xs font-mono p-3 whitespace-pre-wrap break-words">
                                  {JSON.stringify(log.requestBody, null, 2)}
                                </pre>
                              </ScrollArea>
                            </div>
                          )}
                          <div className={log.requestBody ? "" : "lg:col-span-2"}>
                            <p className="text-xs font-semibold mb-2 text-green-600 dark:text-green-400">Response:</p>
                            <ScrollArea className="h-[400px] w-full rounded border bg-muted/30">
                              <pre className="text-xs font-mono p-3 whitespace-pre-wrap break-words">
                                {JSON.stringify(log.response, null, 2)}
                              </pre>
                            </ScrollArea>
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </div>
        </ScrollArea>
      </div>
    </>
  )
}
