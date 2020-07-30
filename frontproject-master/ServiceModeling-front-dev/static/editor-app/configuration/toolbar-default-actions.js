/*
 * Activiti Modeler component part of the Activiti project
 * Copyright 2005-2014 Alfresco Software, Ltd. All rights reserved.
 *
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 2.1 of the License, or (at your option) any later version.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.

 * You should have received a copy of the GNU Lesser General Public
 * License along with this library; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA
 */
'use strict'

var KISBPM = KISBPM || {}
KISBPM.TOOLBAR = {
  ACTIONS: {

    saveModel: function (services) {
      var modelMetaData = services.$scope.editor.getModelMetaData()

      var selection = services.$scope.editor.getSelection()
      services.$scope.editor.setSelection([])

      // Get the serialized svg image source
      var svgClone = services.$scope.editor.getCanvas().getSVGRepresentation(true)
      services.$scope.editor.setSelection(selection)
      if (services.$scope.editor.getCanvas().properties['oryx-showstripableelements'] === false) {
        var stripOutArray = jQuery(svgClone).find('.stripable-element')
        for (var i = stripOutArray.length - 1; i >= 0; i--) {
          stripOutArray[i].remove()
        }
      }

      // Remove all forced stripable elements
      var stripOutArray = jQuery(svgClone).find('.stripable-element-force')
      for (var i = stripOutArray.length - 1; i >= 0; i--) {
        stripOutArray[i].remove()
      }

      // Parse dom to string
      var svgDOM = DataManager.serialize(svgClone)
      svgDOM = svgDOM.replace(/marker-start="url\("#/g, 'marker-start="url(#').replace(/start"\)"/g, 'start\)"')
      svgDOM = svgDOM.replace(/marker-mid="url\("#/g, 'marker-mid="url(#').replace(/mid"\)"/g, 'mid\)"')
      svgDOM = svgDOM.replace(/marker-end="url\("#/g, 'marker-end="url(#').replace(/end"\)"/g, 'end\)"')
      var params = {
        jsonContent: JSON.stringify(services.$scope.editor.getJSON()),
        imageContent: svgDOM,
        diagramName: modelMetaData.name
      }

      // Update
      services.$http({
        method: 'PUT',
        data: params,
        ignoreErrors: true,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        },
        transformRequest: function (obj) {
          var str = []
          for (var p in obj) {
            str.push(encodeURIComponent(p) + '=' + encodeURIComponent(obj[p]))
          }
          return str.join('&')
        },
        url: KISBPM.URL.putModel(modelMetaData.modelId)
      })

        .success(function (data, status, headers, config) {
          services.$scope.editor.handleEvents({
            type: ORYX.CONFIG.EVENT_SAVED
          })

          // Fire event to all who is listening
          var saveEvent = {
            type: KISBPM.eventBus.EVENT_TYPE_MODEL_SAVED,
            model: params,
            modelId: modelMetaData.modelId,
            eventType: 'update-model'
          }
          KISBPM.eventBus.dispatch(KISBPM.eventBus.EVENT_TYPE_MODEL_SAVED, saveEvent)
        })
        .error(function (data, status, headers, config) {
          console.log('Something went wrong when updating the process model:' + JSON.stringify(data))
        })
    },

    undo: function (services) {
      // Get the last commands
      var lastCommands = services.$scope.undoStack.pop()

      if (lastCommands) {
        // Add the commands to the redo stack
        services.$scope.redoStack.push(lastCommands)

        // Force refresh of selection, might be that the undo command
        // impacts properties in the selected item
        if (services.$rootScope && services.$rootScope.forceSelectionRefresh) {
          services.$rootScope.forceSelectionRefresh = true
        }

        // Rollback every command
        for (var i = lastCommands.length - 1; i >= 0; --i) {
          lastCommands[i].rollback()
        }

        // Update and refresh the canvas
        services.$scope.editor.handleEvents({
          type: ORYX.CONFIG.EVENT_UNDO_ROLLBACK,
          commands: lastCommands
        })

        // Update
        services.$scope.editor.getCanvas().update()
        services.$scope.editor.updateSelection()
      }

      var toggleUndo = false
      if (services.$scope.undoStack.length == 0) {
        toggleUndo = true
      }

      var toggleRedo = false
      if (services.$scope.redoStack.length > 0) {
        toggleRedo = true
      }

      if (toggleUndo || toggleRedo) {
        for (var i = 0; i < services.$scope.items.length; i++) {
          var item = services.$scope.items[i]
          if (toggleUndo && item.action === 'KISBPM.TOOLBAR.ACTIONS.undo') {
            services.$scope.safeApply(function () {
              item.enabled = false
            })
          } else if (toggleRedo && item.action === 'KISBPM.TOOLBAR.ACTIONS.redo') {
            services.$scope.safeApply(function () {
              item.enabled = true
            })
          }
        }
      }
    },

    redo: function (services) {
      // Get the last commands from the redo stack
      var lastCommands = services.$scope.redoStack.pop()

      if (lastCommands) {
        // Add this commands to the undo stack
        services.$scope.undoStack.push(lastCommands)

        // Force refresh of selection, might be that the redo command
        // impacts properties in the selected item
        if (services.$rootScope && services.$rootScope.forceSelectionRefresh) {
          services.$rootScope.forceSelectionRefresh = true
        }

        // Execute those commands
        lastCommands.each(function (command) {
          command.execute()
        })

        // Update and refresh the canvas
        services.$scope.editor.handleEvents({
          type: ORYX.CONFIG.EVENT_UNDO_EXECUTE,
          commands: lastCommands
        })

        // Update
        services.$scope.editor.getCanvas().update()
        services.$scope.editor.updateSelection()
      }

      var toggleUndo = false
      if (services.$scope.undoStack.length > 0) {
        toggleUndo = true
      }

      var toggleRedo = false
      if (services.$scope.redoStack.length == 0) {
        toggleRedo = true
      }

      if (toggleUndo || toggleRedo) {
        for (var i = 0; i < services.$scope.items.length; i++) {
          var item = services.$scope.items[i]
          if (toggleUndo && item.action === 'KISBPM.TOOLBAR.ACTIONS.undo') {
            services.$scope.safeApply(function () {
              item.enabled = true
            })
          } else if (toggleRedo && item.action === 'KISBPM.TOOLBAR.ACTIONS.redo') {
            services.$scope.safeApply(function () {
              item.enabled = false
            })
          }
        }
      }
    },

    cut: function (services) {
      KISBPM.TOOLBAR.ACTIONS._getOryxEditPlugin(services.$scope).editCut()
      for (var i = 0; i < services.$scope.items.length; i++) {
        var item = services.$scope.items[i]
        if (item.action === 'KISBPM.TOOLBAR.ACTIONS.paste') {
          services.$scope.safeApply(function () {
            item.enabled = true
          })
        }
      }
    },

    copy: function (services) {
      KISBPM.TOOLBAR.ACTIONS._getOryxEditPlugin(services.$scope).editCopy()
      for (var i = 0; i < services.$scope.items.length; i++) {
        var item = services.$scope.items[i]
        if (item.action === 'KISBPM.TOOLBAR.ACTIONS.paste') {
          services.$scope.safeApply(function () {
            item.enabled = true
          })
        }
      }
    },

    paste: function (services) {
      KISBPM.TOOLBAR.ACTIONS._getOryxEditPlugin(services.$scope).editPaste()
    },

    deleteItem: function (services) {
      KISBPM.TOOLBAR.ACTIONS._getOryxEditPlugin(services.$scope).editDelete()
    },

    addBendPoint: function (services) {
      var dockerPlugin = KISBPM.TOOLBAR.ACTIONS._getOryxDockerPlugin(services.$scope)

      var enableAdd = !dockerPlugin.enabledAdd()
      dockerPlugin.setEnableAdd(enableAdd)
      if (enableAdd) {
        dockerPlugin.setEnableRemove(false)
        document.body.style.cursor = 'pointer'
      } else {
        document.body.style.cursor = 'default'
      }
    },

    removeBendPoint: function (services) {
      var dockerPlugin = KISBPM.TOOLBAR.ACTIONS._getOryxDockerPlugin(services.$scope)

      var enableRemove = !dockerPlugin.enabledRemove()
      dockerPlugin.setEnableRemove(enableRemove)
      if (enableRemove) {
        dockerPlugin.setEnableAdd(false)
        document.body.style.cursor = 'pointer'
      } else {
        document.body.style.cursor = 'default'
      }
    },

    exportModel: function (services) {
      window.location.href = KISBPM.URL.getBPMN(services.$scope.editor.getModelMetaData().modelId)
    },

    splitModel: function (services) {
      var modelMetaData = services.$scope.editor.getModelMetaData()

      services.$scope.editor.setSelection([])

      var params = {
        jsonContent: JSON.stringify(services.$scope.editor.getJSON())
      }

      // Update
      services.$http({
        method: 'PUT',
        data: params,
        ignoreErrors: true,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        },
        transformRequest: function (obj) {
          var str = []
          for (var p in obj) {
            str.push(encodeURIComponent(p) + '=' + encodeURIComponent(obj[p]))
          }
          return str.join('&')
        },
        url: KISBPM.URL.getSplitResult()
      })

        .success(function (data, status, headers, config) {
          // 创建红框部分的节点
          function parseSVG (s) {
            var div = document.createElementNS('http://www.w3.org/1999/xhtml', 'div')
            div.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg">' + s + '</svg>'
            var frag = document.createDocumentFragment()
            while (div.firstChild.firstChild) { frag.appendChild(div.firstChild.firstChild) }
            return frag
          };

          data.data.forEach(rect => {
            var sv = parseSVG(
              '<g transform="translate(' + rect.x + ',' + rect.y + ')">' +
              '<rect width="' + rect.height + '"' + 'height="'+ rect.width +'"' +
              'stroke="red" fill="none" stroke-width="1" stroke-dasharray="2"></rect></g>'
            )
            var toAdd = document.getElementsByClassName('ORYX_Editor')[0].children[0].children[2]
            toAdd.append(sv)
          })
        })
        .error(function (data, status, headers, config) {
          console.log('Something went wrong when updating the process model:' + JSON.stringify(data))
        })
    },
    /**
     * Helper method: fetches the Oryx Edit plugin from the provided scope,
     * if not on the scope, it is created and put on the scope for further use.
     *
     * It's important to reuse the same EditPlugin while the same scope is active,
     * as the clipboard is stored for the whole lifetime of the scope.
     */
    _getOryxEditPlugin: function ($scope) {
      if ($scope.oryxEditPlugin === undefined || $scope.oryxEditPlugin === null) {
        $scope.oryxEditPlugin = new ORYX.Plugins.Edit($scope.editor)
      }
      return $scope.oryxEditPlugin
    },

    zoomIn: function (services) {
      KISBPM.TOOLBAR.ACTIONS._getOryxViewPlugin(services.$scope).zoom([1.0 + ORYX.CONFIG.ZOOM_OFFSET])
    },

    zoomOut: function (services) {
      KISBPM.TOOLBAR.ACTIONS._getOryxViewPlugin(services.$scope).zoom([1.0 - ORYX.CONFIG.ZOOM_OFFSET])
    },

    zoomActual: function (services) {
      KISBPM.TOOLBAR.ACTIONS._getOryxViewPlugin(services.$scope).setAFixZoomLevel(1)
    },

    zoomFit: function (services) {
      KISBPM.TOOLBAR.ACTIONS._getOryxViewPlugin(services.$scope).zoomFitToModel()
    },

    alignVertical: function (services) {
      KISBPM.TOOLBAR.ACTIONS._getOryxArrangmentPlugin(services.$scope).alignShapes([ORYX.CONFIG.EDITOR_ALIGN_MIDDLE])
    },

    alignHorizontal: function (services) {
      KISBPM.TOOLBAR.ACTIONS._getOryxArrangmentPlugin(services.$scope).alignShapes([ORYX.CONFIG.EDITOR_ALIGN_CENTER])
    },

    sameSize: function (services) {
      KISBPM.TOOLBAR.ACTIONS._getOryxArrangmentPlugin(services.$scope).alignShapes([ORYX.CONFIG.EDITOR_ALIGN_SIZE])
    },

    closeEditor: function (services) {
      // window.location.href = "./index.html";
      window.location.href = '../projects'
    },

    /**
     * Helper method: fetches the Oryx View plugin from the provided scope,
     * if not on the scope, it is created and put on the scope for further use.
     */
    _getOryxViewPlugin: function ($scope) {
      if ($scope.oryxViewPlugin === undefined || $scope.oryxViewPlugin === null) {
        $scope.oryxViewPlugin = new ORYX.Plugins.View($scope.editor)
      }
      return $scope.oryxViewPlugin
    },

    _getOryxArrangmentPlugin: function ($scope) {
      if ($scope.oryxArrangmentPlugin === undefined || $scope.oryxArrangmentPlugin === null) {
        $scope.oryxArrangmentPlugin = new ORYX.Plugins.Arrangement($scope.editor)
      }
      return $scope.oryxArrangmentPlugin
    },

    _getOryxDockerPlugin: function ($scope) {
      if ($scope.oryxDockerPlugin === undefined || $scope.oryxDockerPlugin === null) {
        $scope.oryxDockerPlugin = new ORYX.Plugins.AddDocker($scope.editor)
      }
      return $scope.oryxDockerPlugin
    }
  }
}
