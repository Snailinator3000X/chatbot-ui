import { SidebarCreateItem } from "@/components/sidebar/items/all/sidebar-create-item"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { TextareaAutosize } from "@/components/ui/textarea-autosize"
import { ChatbotUIContext } from "@/context/context"
import { TOOL_DESCRIPTION_MAX, TOOL_NAME_MAX } from "@/db/limits"
import { validateOpenAPI } from "@/lib/openapi-conversion"
import { TablesInsert } from "@/supabase/types"
import { FC, useContext, useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"

interface CreateToolProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
}

export const CreateTool: FC<CreateToolProps> = ({ isOpen, onOpenChange }) => {
  const { profile, selectedWorkspace } = useContext(ChatbotUIContext)

  const [name, setName] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [description, setDescription] = useState("")
  const [url, setUrl] = useState("")
  const [customHeaders, setCustomHeaders] = useState("")
  const [schema, setSchema] = useState("")
  const [schemaError, setSchemaError] = useState("")

  if (!profile || !selectedWorkspace) return null

  const handleCreateTool = async () => {
    const newTool = {
      user_id: profile.user_id,
      name,
      description,
      url,
      custom_headers: customHeaders,
      schema
    } as TablesInsert<"tools">

    console.log("Neues Tool erstellt:", newTool)
    // ... Aktualisierung des States ...
  }

  return (
    <SidebarCreateItem
      contentType="tools"
      createState={
        {
          user_id: profile.user_id,
          name,
          description,
          url,
          custom_headers: customHeaders,
          schema
        } as TablesInsert<"tools">
      }
      isOpen={isOpen}
      isTyping={isTyping}
      renderInputs={() => (
        <>
          <div className="space-y-1">
            <Label>Name</Label>

            <Input
              placeholder="Tool name..."
              value={name}
              onChange={e => setName(e.target.value)}
              maxLength={TOOL_NAME_MAX}
            />
          </div>

          <div className="space-y-1">
            <Label>Description</Label>

            <Input
              placeholder="Tool description..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              maxLength={TOOL_DESCRIPTION_MAX}
            />
          </div>

          <div className="space-y-3 pb-3 pt-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="internet-search"
                checked={name === "Internet Search"}
                onCheckedChange={checked => {
                  if (checked) {
                    setName("Internet Search")
                    setDescription("Search the internet using DuckDuckGo")
                    setUrl("https://api.duckduckgo.com")
                    setCustomHeaders("{}")
                    setSchema(`{
  "openapi": "3.1.0",
  "info": {
    "title": "DuckDuckGo Search API",
    "description": "Search the internet using DuckDuckGo",
    "version": "v1.0.0"
  },
  "servers": [
    {
      "url": "https://api.duckduckgo.com"
    }
  ],
  "paths": {
    "/": {
      "get": {
        "description": "Perform a DuckDuckGo search",
        "operationId": "duckDuckGoSearch",
        "parameters": [
          {
            "name": "q",
            "in": "query",
            "description": "The search query",
            "required": true,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "format",
            "in": "query",
            "description": "The response format",
            "required": true,
            "schema": {
              "type": "string",
              "enum": ["json"]
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Successful response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "AbstractText": {
                      "type": "string"
                    },
                    "Results": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "properties": {
                          "FirstURL": {
                            "type": "string"
                          },
                          "Text": {
                            "type": "string"
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}`)
                  } else {
                    setName("")
                    setDescription("")
                    setUrl("")
                    setCustomHeaders("")
                    setSchema("")
                  }
                }}
              />
              <Label htmlFor="internet-search">
                Internet Search (DuckDuckGo)
              </Label>
            </div>
          </div>

          <div className="space-y-1">
            <Label>Custom Headers</Label>

            <TextareaAutosize
              placeholder={`{"X-api-key": "1234567890"}`}
              value={customHeaders}
              onValueChange={setCustomHeaders}
              minRows={1}
            />
          </div>

          <div className="space-y-1">
            <Label>Schema</Label>

            <TextareaAutosize
              placeholder={`{
                "openapi": "3.1.0",
                "info": {
                  "title": "Get weather data",
                  "description": "Retrieves current weather data for a location.",
                  "version": "v1.0.0"
                },
                "servers": [
                  {
                    "url": "https://weather.example.com"
                  }
                ],
                "paths": {
                  "/location": {
                    "get": {
                      "description": "Get temperature for a specific location",
                      "operationId": "GetCurrentWeather",
                      "parameters": [
                        {
                          "name": "location",
                          "in": "query",
                          "description": "The city and state to retrieve the weather for",
                          "required": true,
                          "schema": {
                            "type": "string"
                          }
                        }
                      ],
                      "deprecated": false
                    }
                  }
                },
                "components": {
                  "schemas": {}
                }
              }`}
              value={schema}
              onValueChange={value => {
                setSchema(value)

                try {
                  const parsedSchema = JSON.parse(value)
                  validateOpenAPI(parsedSchema)
                    .then(() => setSchemaError("")) // Clear error if validation is successful
                    .catch(error => setSchemaError(error.message)) // Set specific validation error message
                } catch (error) {
                  setSchemaError("Invalid JSON format") // Set error for invalid JSON format
                }
              }}
              minRows={15}
            />

            <div className="text-xs text-red-500">{schemaError}</div>
          </div>
        </>
      )}
      onOpenChange={onOpenChange}
    />
  )
}
