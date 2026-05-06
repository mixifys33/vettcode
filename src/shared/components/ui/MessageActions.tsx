"use client"

import React, { useState } from "react"
import { Copy, Check, RefreshCw, Volume2, VolumeX } from "lucide-react"

interface MessageActionsProps {
  content: string
  messageId: string
  onRetry?: () => void
  showRetry?: boolean
  size?: "sm" | "md"
}

const MessageActions: React.FC<MessageActionsProps> = ({
  content,
  messageId,
  onRetry,
  showRetry = true,
  size = "sm"
}) => {
  const [copied, setCopied] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)

  const iconSize = size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4"
  const buttonSize = size === "sm" ? "p-1.5" : "p-2"

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  const toggleSpeech = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
    } else {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel()
      
      // Clean the content (remove markdown symbols)
      const cleanContent = content
        .replace(/\*\*/g, '')
        .replace(/\*/g, '')
        .replace(/###/g, '')
        .replace(/##/g, '')
        .replace(/#/g, '')
        .replace(/>/g, '')
        .replace(/`/g, '')
        .replace(/-\s/g, ', ')
        .replace(/\n/g, '. ')

      const utterance = new SpeechSynthesisUtterance(cleanContent)
      utterance.rate = 0.9
      utterance.pitch = 1
      utterance.lang = 'en-US'
      
      utterance.onend = () => setIsSpeaking(false)
      utterance.onerror = () => setIsSpeaking(false)
      
      window.speechSynthesis.speak(utterance)
      setIsSpeaking(true)
    }
  }

  return (
    <div className="flex items-center gap-1">
      {/* Copy Button */}
      <button
        onClick={copyToClipboard}
        className={`${buttonSize} rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors`}
        title="Copy to clipboard"
      >
        {copied ? (
          <Check className={`${iconSize} text-green-500`} />
        ) : (
          <Copy className={iconSize} />
        )}
      </button>

      {/* Text-to-Speech Button */}
      <button
        onClick={toggleSpeech}
        className={`${buttonSize} rounded-md hover:bg-gray-100 transition-colors ${
          isSpeaking ? 'text-blue-500 bg-blue-50' : 'text-gray-400 hover:text-gray-600'
        }`}
        title={isSpeaking ? "Stop speaking" : "Read aloud"}
      >
        {isSpeaking ? (
          <VolumeX className={iconSize} />
        ) : (
          <Volume2 className={iconSize} />
        )}
      </button>

      {/* Retry Button */}
      {showRetry && onRetry && (
        <button
          onClick={onRetry}
          className={`${buttonSize} rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors`}
          title="Regenerate response"
        >
          <RefreshCw className={iconSize} />
        </button>
      )}
    </div>
  )
}

export default MessageActions

