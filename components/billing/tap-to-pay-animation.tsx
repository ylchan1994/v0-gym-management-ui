"use client"

import { Dialog, DialogContent } from "@/components/ui/dialog"
import { motion } from "framer-motion"

interface TapToPayAnimationProps {
  open: boolean
}

export function TapToPayAnimation({ open }: TapToPayAnimationProps) {
  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md" hideClose>
        <div className="flex flex-col items-center justify-center py-8">
          <h3 className="text-lg font-semibold mb-6">Processing Payment</h3>

          <div className="relative w-48 h-48 mb-6">
            {/* Phone */}
            <motion.div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="w-24 h-36 bg-gradient-to-b from-gray-800 to-gray-900 rounded-2xl border-4 border-gray-700 shadow-xl relative">
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-1 bg-gray-600 rounded-full" />
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-12 h-12 border-2 border-gray-600 rounded-full flex items-center justify-center">
                  <motion.div
                    className="w-8 h-8 bg-blue-500 rounded-full"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                    }}
                  />
                </div>
              </div>
            </motion.div>

            {/* Card */}
            <motion.div
              className="absolute left-1/2 top-0"
              initial={{ x: "-50%", y: -60, opacity: 0 }}
              animate={{
                x: "-50%",
                y: [-60, 20, -60],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
                times: [0, 0.5, 1],
              }}
            >
              <div className="w-20 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg relative overflow-hidden">
                <div className="absolute top-2 left-2 w-8 h-6 bg-yellow-400 rounded opacity-80" />
                <div className="absolute bottom-1 right-2 text-white text-xs font-bold">CARD</div>
                <motion.div
                  className="absolute inset-0 bg-white"
                  initial={{ x: "-100%" }}
                  animate={{ x: "100%" }}
                  transition={{
                    duration: 1.5,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "linear",
                  }}
                  style={{ opacity: 0.2 }}
                />
              </div>
            </motion.div>

            {/* Tap indicator */}
            <motion.div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.3, 0, 0.3],
              }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeOut",
              }}
            >
              <div className="w-32 h-32 border-4 border-blue-500 rounded-full" />
            </motion.div>
          </div>

          <p className="text-sm text-muted-foreground text-center">Please tap your card on the terminal</p>
          <p className="text-xs text-muted-foreground mt-2">Processing payment...</p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
