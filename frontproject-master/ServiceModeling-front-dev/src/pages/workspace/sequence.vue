<template>
	<div style="height: 100%;">
		<b-navbar toggleable="lg" type="dark" variant="primary ">
			<b-navbar-brand id="brand">
				<img src="../../assets/WHU.png" alt="武汉大学" width="40" height="40" class="logo-image">
			</b-navbar-brand>
			<b-navbar-toggle target="nav-collapse"></b-navbar-toggle>
			<b-collapse id="nav-collapse" is-nav>
				<b-navbar-nav>
					<b-nav-item-dropdown text="文件" no-caret>
						<b-dropdown-item class="rename">
							<font-awesome-icon icon="file-medical-alt" />
							<span>重命名</span></b-dropdown-item>

						<b-dropdown-item v-b-modal="'moveFileModal'">
							<font-awesome-icon icon="folder" />
							<span>移动到</span></b-dropdown-item>

						<b-modal id="moveFileModal" size="sm" @ok="moveToFolder">
							<b-form-group label="请选择移动到的文件夹">
								<b-form-select v-model="folderId" :options="folders"></b-form-select>
							</b-form-group>
							<div slot="modal-ok">确定</div>
							<div slot="modal-cancel">取消</div>
						</b-modal>

						<b-dropdown-item v-b-modal="'importModal'">
							<font-awesome-icon icon="upload" />
							<span>导入</span></b-dropdown-item>
						<b-modal id="importModal" size="sm" @ok="loadFile">
							<b-form-group label="请选择导入文件">
								<b-form-file v-model="imFile" accept=".xml, .json"></b-form-file>
							</b-form-group>
							<div slot="modal-ok">导入</div>
							<div slot="modal-cancel">取消</div>
						</b-modal>
						<b-dropdown-item v-b-modal="'outportModal'">
							<font-awesome-icon icon="download" />
							<span>导出</span></b-dropdown-item>
						<b-modal id="outportModal" size="sm" @ok="outportFile">
							<b-form-group label="请选择导出格式">
								<b-form-radio v-model="selectedFormat" name="orad" value="BPMN">BPMN XML file</b-form-radio>
								<b-form-radio v-model="selectedFormat" name="orad" value="RDF">RDF file</b-form-radio>
								<!--                <b-form-radio v-model="selectedFormat" name="orad" value="XML">XML file</b-form-radio>-->
								<b-form-radio v-model="selectedFormat" name="orad" value="JSON">JSON file</b-form-radio>
								<b-form-radio v-model="selectedFormat" name="orad" value="PNG">PNG format image</b-form-radio>
								<b-form-radio v-model="selectedFormat" name="orad" value="SVG">SVG file</b-form-radio>
							</b-form-group>
							<div slot="modal-ok">导出</div>
							<div slot="modal-cancel">取消</div>
						</b-modal>
						<b-dropdown-item @click="$router.back(-1)">
							<font-awesome-icon icon="window-close" />
							<span>退出</span></b-dropdown-item>
					</b-nav-item-dropdown>
					<b-nav-item-dropdown text="编辑" no-caret>
						<b-dropdown-item @click="saveDiagram">
							<font-awesome-icon icon="save" />
							保存
						</b-dropdown-item>
						<b-dropdown-divider></b-dropdown-divider>
						<b-dropdown-item @click="undo">
							<font-awesome-icon icon="undo-alt" />
							撤销
						</b-dropdown-item>
						<b-dropdown-item @click="redo">
							<font-awesome-icon icon="redo-alt" />
							重做
						</b-dropdown-item>
						<b-dropdown-divider></b-dropdown-divider>
						<b-dropdown-item @click="cutSelection">
							<font-awesome-icon icon="cut" />
							剪切
						</b-dropdown-item>
						<b-dropdown-item @click="copySelection">
							<font-awesome-icon icon="copy" />
							复制
						</b-dropdown-item>
						<b-dropdown-item @click="pasteSelection">
							<font-awesome-icon icon="paste" />
							粘贴
						</b-dropdown-item>
						<b-dropdown-divider></b-dropdown-divider>
						<b-dropdown-item @click="groupSelection">
							<font-awesome-icon icon="object-group" />
							组合
						</b-dropdown-item>
						<b-dropdown-item @click="ungroupSelection()">
							<font-awesome-icon icon="object-ungroup" />
							打破组合
						</b-dropdown-item>
					</b-nav-item-dropdown>
					<b-nav-item-dropdown text='网格' no-caret>
						<b-form-group class="group">
							<b-form-select v-model="selectGrid" :options="selectGrids" stacked></b-form-select>
						</b-form-group>
					</b-nav-item-dropdown>
					<!-- 页面部分-->
					<b-nav-item-dropdown text="帮助" no-caret>
						<b-dropdown-item>快捷键总览</b-dropdown-item>
					</b-nav-item-dropdown>
				</b-navbar-nav>
				<!--重命名-->
				<b-navbar-nav>
					<span class="navbar-brand rename" id="project-name" ref="projectName" v-b-tooltip.hover title="Click to rename this project">{{diagram.diagramName}}</span>
				</b-navbar-nav>
				<!--// TODO 搜索框align-right-->
				<!--        <b-navbar-nav class= 'ml-auto' style="padding-left: 400px;">
          <b-nav-form>  
            <b-form-input size="sm" class="mr-sm-2" placeholder="检索字段" id="search-content" v-model="search_content">{{search_content}}}</b-form-input>
            <b-form-select  id="search-type" v-model="search_type" :options="search_types">
            </b-form-select>
            <b-button size="sm" class="my-2 my-sm-0" type="button" @click="search">搜索</b-button>
          </b-nav-form>
        </b-navbar-nav>-->
			</b-collapse>
		</b-navbar>

		<b-row style="position:absolute;top: 50px;bottom: 20px;left: 0px;right: 0px;">
			<!-- 侧边栏 -->
			<b-col v-show="showSideBar" :md="sideBarmd" style="height: 100%">
				<b-list-group class="sidebar-collapse" role="tablist">
					<b-card no-body>
						<b-card-header header-tag="header" class="p-1" role="tab">
							<b-button block href="" v-b-toggle.my-collapse variant="light">基本元素<span class="caret"></span>
							</b-button>
						</b-card-header>
						<b-collapse id="my-collapse" visible accordion="my-accordion" role="tabpanel">
							<b-card-body>
								<div id="myPaletteDiv1" style="height:350px;"></div>
							</b-card-body>
						</b-collapse>
					</b-card>
					<b-card no-body>
						<b-card-header header-tag="header" class="p-1" role="tab">
							<b-button block href="" v-b-toggle.my-collapse2 variant="light">高级元素<span class="caret"></span>
							</b-button>
						</b-card-header>
						<b-collapse id="my-collapse2" visible accordion="my-accordion" role="tabpanel">
							<b-card-body>
								<div id="myPaletteDiv2" style="height:350px;"></div>
							</b-card-body>
						</b-collapse>
					</b-card>

					<b-card no-body>
						<b-card-header header-tag="header" class="p-1" role="tab">
							<b-button block href="" v-b-toggle.my-collapse3 variant="light">其他元素<span class="caret"></span>
							</b-button>
						</b-card-header>
						<b-collapse id="my-collapse3" visible accordion="my-accordion" role="tabpanel">
							<b-card-body>
								<div id="myPaletteDiv3" style="height:350px;"></div>
							</b-card-body>
						</b-collapse>
					</b-card>
					
					<div>
						<div id="sequence" style="border: solid 1px black; width: 100%; height: 400px"></div>
						<button @click="add1">add</button>
					
					</div>
					
					<!-- <b-card no-body v-for="(item, index) in search_diagram_json " :key="index">
						<b-card-header header-tag="header" class="p-1" role="tab">
							<b-button block href="" v-b-toggle="'mySearchCollapse' + index " @click="createSearchDiagram(item,index)"
							 variant="light">
								模板片段<span class="caret"></span>
							</b-button>
						</b-card-header>
						<b-collapse v-bind:id="'mySearchCollapse' + index " accordion="my-accordion" role="tabpanel">
							<b-card-body>
								<div v-bind:id="'mySearchDiagram' + index" style="height:350px;"></div>
							</b-card-body>
						</b-collapse>
					</b-card> -->
				</b-list-group>

			</b-col>
			<!-- 分隔栏 -->
			<div style="cursor: w-resize;width: 5px;background: #D2D2D2" @mousedown="handleEditorDivider"></div>
			<!-- diagram -->
			<b-col style="height: 100%">
				<div id="myDiagramDiv" style="height: 100%; background-color: #DAE4EE;"></div>
				<div style="position: absolute;border: 1px solid #D2D2D2;background-color: #f5f5f5;top:0px;z-index:100;margin-left: 0px;">
					<button title="折叠侧边栏" class="tool-bar-btn" @click="showSideBar=!showSideBar;moveCanvasCenter();"><i class="fas fa-bars"></i></button>
				</div>
				<div id="dock">
					<div class="dock-header"></div>
					<div class="dock-buttons">
						<div id="dock-btn-navigator" title="Navigator" class="tool-bar-btn" @click="setDock(1)"><i class="fa fa-crosshairs"></i></div>
						<div id="dock-btn-attribute" title="Data Attributes" class="tool-bar-btn" @click="setDock(2)"><i class="fa fa-table"></i></div>
						<!--            <div id="dock-btn-error" title="Error Log" class="tool-bar-btn" @click="setDock(4)"><i class="fa fa-exclamation-triangle"></i></div>-->
					</div>
				</div>
				<div class="dock-view" :class="[shownDock===1?'open':'']" id="navigator-view">
					<div class="view-title"><span>导航</span></div>
					<div class="view-body">
						<div id="diagramOverview"></div>
					</div>
				</div>
				<div class="dock-view" :class="[shownDock===2?'open':'']" id="attribute-view">
					<div class="view-title"><span>数据属性</span></div>
					<div class="view-body">
						<div id="attributeTable">
						</div>
					</div>
				</div>
			</b-col>
		</b-row>
		
	</div>
</template>
<script>
	import {
		go
	} from 'gojs/release/go-module'
	import 'gojs/extensions/Figures'
	import {
		XML
	} from './components/ObjTree.js'
	import {
		Inspector
	} from './components/DataInspector'

	const objGo = go.GraphObject.make

	export default {
		name: 'sequence',
		data() {
			
			return {
				// diagram: {
				// 	diagramName: ''
				// },
				diagram: {diagramName: '',
				          diagramId:'',
				          jsonContent:''
				},
				projectRoles: [],
				
				selectedFormat: '',
				myDiagram: null,
				imageData: null,
				shownDock: '',
				strokeStyle: '',
				errors: [],
				imFile: null,
				selectGrid: null,
				selectGrids: [{
						text: '无',
						value: null
					},
					{
						text: '小',
						value: 'small-size'
					},
					{
						text: '正常',
						value: 'normal-size'
					},
					{
						text: '大',
						value: 'big-size'
					},
					{
						text: '更大',
						value: 'bigger-size'
					}
				],
				flag_showgrid: true,
				search_content: '',
				search_type: null,
				search_types: [],
				search_diagram: [],
				search_diagram_json: [],
				showSideBar: true,
				sideBarmd: '3',
				folderId: null,
				folders: [{
					text: '根目录',
					value: null
				}],
				projectGoals: [],
				projectRoles: []
			}
		},
		
		mounted() {
			
			const s = document.createElement('script')
			s.type = 'text/javascript'
			s.src = '/static/js/haha.js'
			document.body.appendChild(s)

			const mySelf = this

			const GradientYellow = objGo(go.Brush, 'Linear', {
				0: 'LightGoldenRodYellow',
				1: '#FFFF66'
			})
			const GradientLightGreen = objGo(go.Brush, 'Linear', {
				0: '#E0FEE0',
				1: 'PaleGreen'
			})
			const GradientLightGray = objGo(go.Brush, 'Linear', {
				0: 'White',
				1: '#DADADA'
			})

			const ActivityNodeFill = objGo(go.Brush, 'Linear', {
				0: 'OldLace',
				1: 'PapayaWhip'
			})
			const ActivityNodeStroke = '#CDAA7D'
			const ActivityMarkerStrokeWidth = 1.5
			const ActivityNodeWidth = 120
			const ActivityNodeHeight = 80
			const ActivityNodeStrokeWidth = 1
			const ActivityNodeStrokeWidthIsCall = 4

			const SubprocessNodeFill = ActivityNodeFill
			const SubprocessNodeStroke = ActivityNodeStroke

			const EventNodeSize = 42
			const EventNodeInnerSize = EventNodeSize - 6
			const EventNodeSymbolSize = EventNodeInnerSize - 14
			const EventEndOuterFillColor = 'pink'
			const EventBackgroundColor = GradientLightGreen
			const EventSymbolLightFill = 'white'
			const EventSymbolDarkFill = 'dimgray'
			const EventDimensionStrokeColor = 'green'
			const EventDimensionStrokeEndColor = 'red'
			const EventNodeStrokeWidthIsEnd = 4

			const GatewayNodeSize = 80
			const GatewayNodeSymbolSize = 45
			const GatewayNodeFill = GradientYellow
			const GatewayNodeStroke = 'darkgoldenrod'
			const GatewayNodeSymbolStroke = 'darkgoldenrod'
			const GatewayNodeSymbolFill = GradientYellow
			const GatewayNodeSymbolStrokeWidth = 3

			const DataFill = GradientLightGray

			// custom figures for Shapes

			go.Shape.defineFigureGenerator('Empty', function(shape, w, h) {
				return new go.Geometry()
			})

			const annotationStr = 'M 150,0L 0,0L 0,600L 150,600 M 800,0'
			const annotationGeo = go.Geometry.parse(annotationStr)
			annotationGeo.normalize()
			go.Shape.defineFigureGenerator('Annotation', function(shape, w, h) {
				const geo = annotationGeo.copy()
				// calculate how much to scale the Geometry so that it fits in w x h
				const bounds = geo.bounds
				const scale = Math.min(w / bounds.width, h / bounds.height)
				geo.scale(scale, scale)
				return geo
			})

			const gearStr = 'F M 391,5L 419,14L 444.5,30.5L 451,120.5L 485.5,126L 522,141L 595,83L 618.5,92L 644,106.5' +
				'L 660.5,132L 670,158L 616,220L 640.5,265.5L 658.122,317.809L 753.122,322.809L 770.122,348.309L 774.622,374.309' +
				'L 769.5,402L 756.622,420.309L 659.122,428.809L 640.5,475L 616.5,519.5L 670,573.5L 663,600L 646,626.5' +
				'L 622,639L 595,645.5L 531.5,597.5L 493.192,613.462L 450,627.5L 444.5,718.5L 421.5,733L 393,740.5L 361.5,733.5' +
				'L 336.5,719L 330,627.5L 277.5,611.5L 227.5,584.167L 156.5,646L 124.5,641L 102,626.5L 82,602.5L 78.5,572.5' +
				'L 148.167,500.833L 133.5,466.833L 122,432.5L 26.5,421L 11,400.5L 5,373.5L 12,347.5L 26.5,324L 123.5,317.5' +
				'L 136.833,274.167L 154,241L 75.5,152.5L 85.5,128.5L 103,105.5L 128.5,88.5001L 154.872,82.4758L 237,155' +
				'L 280.5,132L 330,121L 336,30L 361,15L 391,5 Z M 398.201,232L 510.201,275L 556.201,385L 505.201,491L 399.201,537' +
				'L 284.201,489L 242.201,385L 282.201,273L 398.201,232 Z'
			const gearGeo = go.Geometry.parse(gearStr)
			gearGeo.normalize()

			go.Shape.defineFigureGenerator('BpmnTaskService', function(shape, w, h) {
				const geo = gearGeo.copy()
				// calculate how much to scale the Geometry so that it fits in w x h
				const bounds = geo.bounds
				const scale = Math.min(w / bounds.width, h / bounds.height)
				geo.scale(scale, scale)
				// text should go in the hand
				geo.spot1 = new go.Spot(0, 0.6, 10, 0)
				geo.spot2 = new go.Spot(1, 1)
				return geo
			})

			const handGeo = go.Geometry.parse('F1M18.13,10.06 C18.18,10.07 18.22,10.07 18.26,10.08 18.91,' +
				'10.20 21.20,10.12 21.28,12.93 21.36,15.75 21.42,32.40 21.42,32.40 21.42,' +
				'32.40 21.12,34.10 23.08,33.06 23.08,33.06 22.89,24.76 23.80,24.17 24.72,' +
				'23.59 26.69,23.81 27.19,24.40 27.69,24.98 28.03,24.97 28.03,33.34 28.03,' +
				'33.34 29.32,34.54 29.93,33.12 30.47,31.84 29.71,27.11 30.86,26.56 31.80,' +
				'26.12 34.53,26.12 34.72,28.29 34.94,30.82 34.22,36.12 35.64,35.79 35.64,' +
				'35.79 36.64,36.08 36.72,34.54 36.80,33.00 37.17,30.15 38.42,29.90 39.67,' +
				'29.65 41.22,30.20 41.30,32.29 41.39,34.37 42.30,46.69 38.86,55.40 35.75,' +
				'63.29 36.42,62.62 33.47,63.12 30.76,63.58 26.69,63.12 26.69,63.12 26.69,' +
				'63.12 17.72,64.45 15.64,57.62 13.55,50.79 10.80,40.95 7.30,38.95 3.80,' +
				'36.95 4.24,36.37 4.28,35.35 4.32,34.33 7.60,31.25 12.97,35.75 12.97,' +
				'35.75 16.10,39.79 16.10,42.00 16.10,42.00 15.69,14.30 15.80,12.79 15.96,' +
				'10.75 17.42,10.04 18.13,10.06z ')
			handGeo.rotate(90, 0, 0)
			handGeo.normalize()
			go.Shape.defineFigureGenerator('BpmnTaskManual', function(shape, w, h) {
				const geo = handGeo.copy()
				// calculate how much to scale the Geometry so that it fits in w x h
				const bounds = geo.bounds
				const scale = Math.min(w / bounds.width, h / bounds.height)
				geo.scale(scale, scale)
				// guess where text should go (in the hand)
				geo.spot1 = new go.Spot(0, 0.6, 10, 0)
				geo.spot2 = new go.Spot(1, 1)
				return geo
			})

			// define the appearance of tooltips, shared by various templates
			const tooltiptemplate =
				objGo < go.Adornment > ('ToolTip',
					objGo(go.TextBlock, {
							margin: 3,
							editable: true
						},
						new go.Binding('text', '', function(data) {
							if (data.item !== undefined) return data.item
							return '(unnamed item)'
						}))
				)

			// conversion functions used by data Bindings

			function nodeActivityTaskTypeConverter(s) {
				const tasks = ['Empty',
					'BpmnTaskMessage',
					'BpmnTaskUser',
					'BpmnTaskManual', // Custom hand symbol
					'BpmnTaskScript',
					'BpmnTaskMessage', // should be black on white
					'BpmnTaskService', // Custom gear symbol
					'InternalStorage'
				]
				if (s < tasks.length) return tasks[s]
				return 'NotAllowed' // error
			}

			// location of event on boundary of Activity is based on the index of the event in the boundaryEventArray
			function nodeActivityBESpotConverter(s) {
				const x = 10 + (EventNodeSize / 2)
				if (s === 0) return new go.Spot(0, 1, x, 0) // bottom left
				if (s === 1) return new go.Spot(1, 1, -x, 0) // bottom right
				if (s === 2) return new go.Spot(1, 0, -x, 0) // top right
				return new go.Spot(1, 0, -x - (s - 2) * EventNodeSize, 0) // top ... right-to-left-ish spread
			}

			function nodeActivityTaskTypeColorConverter(s) {
				return (s === 5) ? 'dimgray' : 'white'
			}

			function nodeEventTypeConverter(s) { // order here from BPMN 2.0 poster
				const tasks = ['NotAllowed',
					'Empty',
					'BpmnTaskMessage',
					'BpmnEventTimer',
					'BpmnEventEscalation',
					'BpmnEventConditional',
					'Arrow',
					'BpmnEventError',
					'ThinX',
					'BpmnActivityCompensation',
					'Triangle',
					'Pentagon',
					'ThickCross',
					'Circle'
				]
				if (s < tasks.length) return tasks[s]
				return 'NotAllowed' // error
			}

			function nodeEventDimensionStrokeColorConverter(s) {
				if (s === 8) return EventDimensionStrokeEndColor
				return EventDimensionStrokeColor
			}

			function nodeEventDimensionSymbolFillConverter(s) {
				if (s <= 6) return EventSymbolLightFill
				return EventSymbolDarkFill
			}

			// ------------------------------------------  Activity Node Boundary Events   ----------------------------------------------

			const boundaryEventMenu = // context menu for each boundaryEvent on Activity node
				objGo('ContextMenu',
					objGo('ContextMenuButton',
						objGo(go.TextBlock, 'Remove event'),
						// in the click event handler, the obj.part is the Adornment; its adornedObject is the port
						{
							click: function(e, obj) {
								removeActivityNodeBoundaryEvent(obj.part.adornedObject)
							}
						})
				)

			// removing a boundary event doesn't not reposition other BE circles on the node
			// just reassigning alignmentIndex in remaining BE would do that.
			function removeActivityNodeBoundaryEvent(obj) {
				if (obj === null || obj.panel === null || obj.panel.itemArray === null) return
				mySelf.myDiagram.startTransaction('removeBoundaryEvent')
				const pid = obj.portId
				const arr = obj.panel.itemArray
				for (let i = 0; i < arr.length; i++) {
					if (arr[i].portId === pid) {
						mySelf.myDiagram.model.removeArrayItem(arr, i)
						break
					}
				}
				mySelf.myDiagram.commitTransaction('removeBoundaryEvent')
			}

			const boundaryEventItemTemplate =
				objGo(go.Panel, 'Spot', {
						contextMenu: boundaryEventMenu,
						alignmentFocus: go.Spot.Center,
						fromLinkable: true,
						toLinkable: false,
						cursor: 'pointer',
						fromSpot: go.Spot.Bottom,
						fromMaxLinks: 1,
						toMaxLinks: 0
					},
					new go.Binding('portId', 'portId'),
					new go.Binding('alignment', 'alignmentIndex', nodeActivityBESpotConverter),
					objGo(go.Shape, 'Circle', {
							desiredSize: new go.Size(EventNodeSize, EventNodeSize)
						},
						new go.Binding('strokeDashArray', 'eventDimension', function(s) {
							return (s === 6) ? [4, 2] : null
						}),
						new go.Binding('fromSpot', 'alignmentIndex',
							function(s) {
								//  nodeActivityBEFromSpotConverter, 0 & 1 go on bottom, all others on top of activity
								if (s < 2) return go.Spot.Bottom
								return go.Spot.Top
							}),
						new go.Binding('fill', 'color')),
					objGo(go.Shape, 'Circle', {
							alignment: go.Spot.Center,
							desiredSize: new go.Size(EventNodeInnerSize, EventNodeInnerSize),
							fill: null
						},
						new go.Binding('strokeDashArray', 'eventDimension', function(s) {
							return (s === 6) ? [4, 2] : null
						})
					),
					objGo(go.Shape, 'NotAllowed', {
							alignment: go.Spot.Center,
							desiredSize: new go.Size(EventNodeSymbolSize, EventNodeSymbolSize),
							fill: 'white'
						},
						new go.Binding('figure', 'eventType', nodeEventTypeConverter)
					)
				)

			// ------------------------------------------  Activity Node contextMenu   ----------------------------------------------

			// swimlanes
			const MINLENGTH = 400 // this controls the minimum length of any swimlane
			const MINBREADTH = 20 // this controls the minimum breadth of any non-collapsed swimlane

			// Add a port to the specified side of the selected nodes.   name is beN  (be0, be1)
			// evDim is 5 for Interrupting, 6 for non-Interrupting
			function addActivityNodeBoundaryEvent(evType, evDim) {
				mySelf.myDiagram.startTransaction('addBoundaryEvent')
				mySelf.myDiagram.selection.each(function(node) {
					// skip any selected Links
					if (!(node instanceof go.Node)) return
					if (node.data && (node.data.category === 'activity' || node.data.category === 'subprocess')) {
						// compute the next available index number for the side
						let i = 0
						const defaultPort = node.findPort('')
						while (node.findPort('be' + i.toString()) !== defaultPort) i++ // now this new port name is unique within the whole Node because of the side prefix
						const name = 'be' + i.toString()
						if (!node.data.boundaryEventArray) {
							mySelf.myDiagram.model.setDataProperty(node.data, 'boundaryEventArray', [])
						} // initialize the Array of port data if necessary
						// create a new port data object
						const newportdata = {
							portId: name,
							eventType: evType,
							eventDimension: evDim,
							color: 'white',
							alignmentIndex: i
							// if you add port data properties here, you should copy them in copyPortData above  ** BUG...  we don't do that.
						}
						// and add it to the Array of port data
						mySelf.myDiagram.model.insertArrayItem(node.data.boundaryEventArray, -1, newportdata)
					}
				})
				mySelf.myDiagram.commitTransaction('addBoundaryEvent')
			}

			function rename(obj) {
				if (obj === null || obj.part === null || obj.part.data === null) return
				mySelf.myDiagram.startTransaction('rename')
				const newName = prompt('Rename ' + obj.part.data.item + ' to:')
				mySelf.myDiagram.model.setDataProperty(obj.part.data, 'item', newName)
				mySelf.myDiagram.commitTransaction('rename')
			}

			const activityNodeMenu =
				objGo('ContextMenu',
					objGo('ContextMenuButton', objGo(go.TextBlock, 'Add Email Event', {
						margin: 3
					}), {
						click: function(e, obj) {
							addActivityNodeBoundaryEvent(2, 5)
						}
					}),
					objGo('ContextMenuButton', objGo(go.TextBlock, 'Add Timer Event', {
						margin: 3
					}), {
						click: function(e, obj) {
							addActivityNodeBoundaryEvent(3, 5)
						}
					}),
					objGo('ContextMenuButton', objGo(go.TextBlock, 'Add Escalation Event', {
						margin: 3
					}), {
						click: function(e, obj) {
							addActivityNodeBoundaryEvent(4, 5)
						}
					}),
					objGo('ContextMenuButton', objGo(go.TextBlock, 'Add Error Event', {
						margin: 3
					}), {
						click: function(e, obj) {
							addActivityNodeBoundaryEvent(7, 5)
						}
					}),
					objGo('ContextMenuButton', objGo(go.TextBlock, 'Add Signal Event', {
						margin: 3
					}), {
						click: function(e, obj) {
							addActivityNodeBoundaryEvent(10, 5)
						}
					}),
					objGo('ContextMenuButton', objGo(go.TextBlock, 'Add N-I Escalation Event', {
						margin: 3
					}), {
						click: function(e, obj) {
							addActivityNodeBoundaryEvent(4, 6)
						}
					}),
					objGo('ContextMenuButton', objGo(go.TextBlock, 'Rename', {
						margin: 3
					}), {
						click: function(e, obj) {
							rename(obj)
						}
					}))

			// sub-process,  loop, parallel, sequential, ad doc and compensation markers in horizontal array
			function makeSubButton(sub) {
				if (sub) {
					return [objGo('SubGraphExpanderButton'),
						{
							margin: 2,
							visible: false
						},
						new go.Binding('visible', 'isSubProcess')
					]
				} else {
					return [objGo('Button',
							objGo(go.Shape, // the icon
								{
									name: 'ButtonIcon',
									figure: 'PlusLine', // default value for isSubGraphExpanded is true
									stroke: '#424242',
									strokeWidth: 2,
									desiredSize: new go.Size(8, 8)
								}
								// bind the Shape.figure to the Group.isSubGraphExpanded value using this converter:
							), {
								visible: false
							},
							new go.Binding('visible', 'isCall')
						),
						{
							margin: 2
						}
					]
					// return []
				}
			}

			// sub-process,  loop, parallel, sequential, ad doc and compensation markers in horizontal array
			function makeMarkerPanel(sub, scale) {
				return objGo(go.Panel, 'Horizontal', {
						alignment: go.Spot.MiddleBottom,
						alignmentFocus: go.Spot.MiddleBottom
					},
					objGo(go.Shape, 'BpmnActivityLoop', {
						width: 12 / scale,
						height: 12 / scale,
						margin: 2,
						visible: false,
						strokeWidth: ActivityMarkerStrokeWidth
					}, new go.Binding('visible', 'isLoop')),
					objGo(go.Shape, 'BpmnActivityParallel', {
						width: 12 / scale,
						height: 12 / scale,
						margin: 2,
						visible: false,
						strokeWidth: ActivityMarkerStrokeWidth
					}, new go.Binding('visible', 'isParallel')),
					objGo(go.Shape, 'BpmnActivitySequential', {
						width: 12 / scale,
						height: 12 / scale,
						margin: 2,
						visible: false,
						strokeWidth: ActivityMarkerStrokeWidth
					}, new go.Binding('visible', 'isSequential')),
					objGo(go.Shape, 'BpmnActivityAdHoc', {
						width: 12 / scale,
						height: 12 / scale,
						margin: 2,
						visible: false,
						strokeWidth: ActivityMarkerStrokeWidth
					}, new go.Binding('visible', 'isAdHoc')),
					objGo(go.Shape, 'BpmnActivityCompensation', {
						width: 12 / scale,
						height: 12 / scale,
						margin: 2,
						visible: false,
						strokeWidth: ActivityMarkerStrokeWidth,
						fill: null
					}, new go.Binding('visible', 'isCompensation')),
					makeSubButton(sub)
				) // end activity markers horizontal panel
			}

			const activityNodeTemplate =
				objGo(go.Node, 'Spot', {
						locationObjectName: 'SHAPE',
						locationSpot: go.Spot.Center,
						resizable: true,
						resizeObjectName: 'PANEL',
						toolTip: tooltiptemplate,
						selectionAdorned: false, // use a Binding on the Shape.stroke to show selection
						contextMenu: activityNodeMenu,
						itemTemplate: boundaryEventItemTemplate
					},
					new go.Binding('itemArray', 'boundaryEventArray'),
					new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify),
					// move a selected part into the Foreground layer, so it isn"t obscured by any non-selected parts
					new go.Binding('layerName', 'isSelected', function(s) {
						return s ? 'Foreground' : ''
					}).ofObject(),
					objGo(go.Panel, 'Auto', {
							name: 'PANEL',
							minSize: new go.Size(ActivityNodeWidth, ActivityNodeHeight),
							desiredSize: new go.Size(ActivityNodeWidth, ActivityNodeHeight)
						},
						new go.Binding('desiredSize', 'size', go.Size.parse).makeTwoWay(go.Size.stringify),
						objGo(go.Panel, 'Spot',
							objGo(go.Shape, 'RoundedRectangle', // the outside rounded rectangle
								{
									name: 'SHAPE',
									fill: ActivityNodeFill,
									stroke: ActivityNodeStroke,
									parameter1: 10, // corner size
									portId: '',
									fromLinkable: true,
									toLinkable: true,
									cursor: 'pointer',
									fromSpot: go.Spot.RightSide,
									toSpot: go.Spot.LeftSide
								},
								new go.Binding('fill', 'color'),
								new go.Binding('strokeWidth', 'isCall',
									function(s) {
										return s ? ActivityNodeStrokeWidthIsCall : ActivityNodeStrokeWidth
									})
							),
							//        objGo(go.Shape, "RoundedRectangle",  // the inner "Transaction" rounded rectangle
							//          { margin: 3,
							//            stretch: go.GraphObject.Fill,
							//            stroke: ActivityNodeStroke,
							//            parameter1: 8, fill: null, visible: false
							//          },
							//          new go.Binding("visible", "isTransaction")
							//         ),
							// task icon
							objGo(go.Shape, 'BpmnTaskScript', // will be None, Script, Manual, Service, etc via converter
								{
									alignment: new go.Spot(0, 0, 5, 5),
									alignmentFocus: go.Spot.TopLeft,
									width: 22,
									height: 22
								},
								new go.Binding('fill', 'taskType', nodeActivityTaskTypeColorConverter),
								new go.Binding('figure', 'taskType', nodeActivityTaskTypeConverter)
							), // end Task Icon
							makeMarkerPanel(false, 1) // sub-process,  loop, parallel, sequential, ad doc and compensation markers
						), // end main body rectangles spot panel
						objGo(go.TextBlock, // the center text
							{
								alignment: go.Spot.Center,
								textAlign: 'center',
								margin: 12,
								editable: true
							},
							new go.Binding('text').makeTwoWay())
					) // end Auto Panel
				) // end go.Node, which is a Spot Panel with bound itemArray

			// ------------------------------- template for Activity / Task node in Palette  -------------------------------

			const palscale = 2
			const activityNodeTemplateForPalette =
				objGo(go.Node, 'Vertical', {
						locationObjectName: 'SHAPE',
						locationSpot: go.Spot.Center,
						selectionAdorned: false
					},
					new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify),
					objGo(go.Panel, 'Spot', {
							name: 'PANEL',
							desiredSize: new go.Size(ActivityNodeWidth / palscale, ActivityNodeHeight / palscale)
						},
						objGo(go.Shape, 'RoundedRectangle', // the outside rounded rectangle
							{
								name: 'SHAPE',
								fill: ActivityNodeFill,
								stroke: ActivityNodeStroke,
								parameter1: 10 / palscale // corner size (default 10)
							},
							new go.Binding('strokeWidth', 'isCall',
								function(s) {
									return s ? ActivityNodeStrokeWidthIsCall : ActivityNodeStrokeWidth
								})),
						objGo(go.Shape, 'RoundedRectangle', // the inner "Transaction" rounded rectangle
							{
								margin: 3,
								stretch: go.GraphObject.Fill,
								stroke: ActivityNodeStroke,
								parameter1: 8 / palscale,
								fill: null,
								visible: false
							},
							new go.Binding('visible', 'isTransaction')),
						// task icon
						objGo(go.Shape, 'BpmnTaskScript', // will be None, Script, Manual, Service, etc via converter
							{
								alignment: new go.Spot(0, 0, 5, 5),
								alignmentFocus: go.Spot.TopLeft,
								width: 22 / palscale,
								height: 22 / palscale
							},
							new go.Binding('fill', 'taskType', nodeActivityTaskTypeColorConverter),
							new go.Binding('figure', 'taskType', nodeActivityTaskTypeConverter)),
						makeMarkerPanel(false, palscale) // sub-process,  loop, parallel, sequential, ad doc and compensation markers
					), // End Spot panel
					objGo(go.TextBlock, // the center text
						{
							alignment: go.Spot.Center,
							textAlign: 'center',
							margin: 2
						},
						new go.Binding('text'))
				) // End Node

			const subProcessGroupTemplateForPalette =
				objGo(go.Group, 'Vertical', {
						locationObjectName: 'SHAPE',
						locationSpot: go.Spot.Center,
						isSubGraphExpanded: false,
						selectionAdorned: false
					},
					objGo(go.Panel, 'Spot', {
							name: 'PANEL',
							desiredSize: new go.Size(ActivityNodeWidth / palscale, ActivityNodeHeight / palscale)
						},
						objGo(go.Shape, 'RoundedRectangle', // the outside rounded rectangle
							{
								name: 'SHAPE',
								fill: ActivityNodeFill,
								stroke: ActivityNodeStroke,
								parameter1: 10 / palscale // corner size (default 10)
							},
							new go.Binding('strokeWidth', 'isCall', function(s) {
								return s ? ActivityNodeStrokeWidthIsCall : ActivityNodeStrokeWidth
							})
						),
						objGo(go.Shape, 'RoundedRectangle', // the inner "Transaction" rounded rectangle
							{
								margin: 3,
								stretch: go.GraphObject.Fill,
								stroke: ActivityNodeStroke,
								parameter1: 8 / palscale,
								fill: null,
								visible: false
							},
							new go.Binding('visible', 'isTransaction')),
						makeMarkerPanel(true, palscale) // sub-process,  loop, parallel, sequential, ad doc and compensation markers
					), // end main body rectangles spot panel
					objGo(go.TextBlock, // the center text
						{
							alignment: go.Spot.Center,
							textAlign: 'center',
							margin: 2
						},
						new go.Binding('text'))
				) // end go.Group

			// ------------------------------------------  Event Node Template  ----------------------------------------------

			const eventNodeTemplate =
				objGo(go.Node, 'Vertical', {
						locationObjectName: 'SHAPE',
						locationSpot: go.Spot.Center,
						toolTip: tooltiptemplate
					},
					new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify),
					// move a selected part into the Foreground layer, so it isn't obscured by any non-selected parts
					new go.Binding('layerName', 'isSelected', function(s) {
						return s ? 'Foreground' : ''
					}).ofObject(),
					// can be resided according to the user's desires
					{
						resizable: false,
						resizeObjectName: 'SHAPE'
					},
					objGo(go.Panel, 'Spot',
						objGo(go.Shape, 'Circle', // Outer circle
							{
								strokeWidth: 1,
								name: 'SHAPE',
								desiredSize: new go.Size(EventNodeSize, EventNodeSize),
								portId: '',
								fromLinkable: true,
								toLinkable: true,
								cursor: 'pointer',
								fromSpot: go.Spot.RightSide,
								toSpot: go.Spot.LeftSide
							},
							// allows the color to be determined by the node data
							new go.Binding('fill', 'eventDimension', function(s) {
								return (s === 8) ? EventEndOuterFillColor : EventBackgroundColor
							}),
							new go.Binding('strokeWidth', 'eventDimension', function(s) {
								return s === 8 ? EventNodeStrokeWidthIsEnd : 1
							}),
							new go.Binding('stroke', 'eventDimension', nodeEventDimensionStrokeColorConverter),
							new go.Binding('strokeDashArray', 'eventDimension', function(s) {
								return (s === 3 || s === 6) ? [4, 2] : null
							}),
							new go.Binding('desiredSize', 'size', go.Size.parse).makeTwoWay(go.Size.stringify)
						), // end main shape
						objGo(go.Shape, 'Circle', // Inner circle
							{
								alignment: go.Spot.Center,
								desiredSize: new go.Size(EventNodeInnerSize, EventNodeInnerSize),
								fill: null
							},
							new go.Binding('stroke', 'eventDimension', nodeEventDimensionStrokeColorConverter),
							new go.Binding('strokeDashArray', 'eventDimension', function(s) {
								return (s === 3 || s === 6) ? [4, 2] : null
							}), // dashes for non-interrupting
							new go.Binding('visible', 'eventDimension', function(s) {
								return s > 3 && s <= 7
							}) // inner  only visible for 4 thru 7
						),
						objGo(go.Shape, 'NotAllowed', {
								alignment: go.Spot.Center,
								desiredSize: new go.Size(EventNodeSymbolSize, EventNodeSymbolSize),
								stroke: 'black'
							},
							new go.Binding('figure', 'eventType', nodeEventTypeConverter),
							new go.Binding('fill', 'eventDimension', nodeEventDimensionSymbolFillConverter)
						)
					), // end Auto Panel
					objGo(go.TextBlock, {
							alignment: go.Spot.Center,
							textAlign: 'center',
							margin: 5,
							editable: true
						},
						new go.Binding('text').makeTwoWay())
				) // end go.Node Vertical

			// ------------------------------------------  Gateway Node Template   ----------------------------------------------

			function nodeGatewaySymbolTypeConverter(s) {
				const tasks = ['NotAllowed',
					'ThinCross', // 1 - Parallel
					'Circle', // 2 - Inclusive
					'AsteriskLine', // 3 - Complex
					'ThinX', // 4 - Exclusive  (exclusive can also be no symbol, just bind to visible=false for no symbol)
					'Pentagon', // 5 - double cicle event based gateway
					'Pentagon', // 6 - exclusive event gateway to start a process (single circle)
					'ThickCross'
				] // 7 - parallel event gateway to start a process (single circle)
				if (s < tasks.length) return tasks[s]
				return 'NotAllowed' // error
			}

			// tweak the size of some of the gateway icons
			function nodeGatewaySymbolSizeConverter(s) {
				const size = new go.Size(GatewayNodeSymbolSize, GatewayNodeSymbolSize)
				if (s === 4) {
					size.width = size.width / 4 * 3
					size.height = size.height / 4 * 3
				} else if (s > 4) {
					size.width = size.width / 1.6
					size.height = size.height / 1.6
				}
				return size
			}

			function nodePalGatewaySymbolSizeConverter(s) {
				const size = nodeGatewaySymbolSizeConverter(s)
				size.width = size.width / 2
				size.height = size.height / 2
				return size
			}

			const gatewayNodeTemplate =
				objGo(go.Node, 'Vertical', {
						locationObjectName: 'SHAPE',
						locationSpot: go.Spot.Center,
						toolTip: tooltiptemplate
					},
					new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify),
					// move a selected part into the Foreground layer, so it isn't obscured by any non-selected parts
					new go.Binding('layerName', 'isSelected', function(s) {
						return s ? 'Foreground' : ''
					}).ofObject(),
					// can be resided according to the user's desires
					{
						resizable: false,
						resizeObjectName: 'SHAPE'
					},
					objGo(go.Panel, 'Spot',
						objGo(go.Shape, 'Diamond', {
								strokeWidth: 1,
								fill: GatewayNodeFill,
								stroke: GatewayNodeStroke,
								name: 'SHAPE',
								desiredSize: new go.Size(GatewayNodeSize, GatewayNodeSize),
								portId: '',
								fromLinkable: true,
								toLinkable: true,
								cursor: 'pointer',
								fromSpot: go.Spot.NotLeftSide,
								toSpot: go.Spot.NotRightSide
							},
							new go.Binding('desiredSize', 'size', go.Size.parse).makeTwoWay(go.Size.stringify)), // end main shape
						objGo(go.Shape, 'NotAllowed', {
								alignment: go.Spot.Center,
								stroke: GatewayNodeSymbolStroke,
								fill: GatewayNodeSymbolFill
							},
							new go.Binding('figure', 'gatewayType', nodeGatewaySymbolTypeConverter),
							// new go.Binding("visible", "gatewayType", function(s) { return s !== 4; }),   // comment out if you want exclusive gateway to be X instead of blank.
							new go.Binding('strokeWidth', 'gatewayType', function(s) {
								return (s <= 4) ? GatewayNodeSymbolStrokeWidth : 1
							}),
							new go.Binding('desiredSize', 'gatewayType', nodeGatewaySymbolSizeConverter)),
						// the next 2 circles only show up for event gateway
						objGo(go.Shape, 'Circle', // Outer circle
							{
								strokeWidth: 1,
								stroke: GatewayNodeSymbolStroke,
								fill: null,
								desiredSize: new go.Size(EventNodeSize, EventNodeSize)
							},
							new go.Binding('visible', 'gatewayType', function(s) {
								return s >= 5
							}) // only visible for > 5
						), // end main shape
						objGo(go.Shape, 'Circle', // Inner circle
							{
								alignment: go.Spot.Center,
								stroke: GatewayNodeSymbolStroke,
								desiredSize: new go.Size(EventNodeInnerSize, EventNodeInnerSize),
								fill: null
							},
							new go.Binding('visible', 'gatewayType', function(s) {
								return s === 5
							}) // inner  only visible for == 5
						)
					),
					objGo(go.TextBlock, {
							alignment: go.Spot.Center,
							textAlign: 'center',
							margin: 5,
							editable: true
						},
						new go.Binding('text').makeTwoWay())
				) // end go.Node Vertical

			// --------------------------------------------------------------------------------------------------------------

			const gatewayNodeTemplateForPalette =
				objGo(go.Node, 'Vertical', {
						toolTip: tooltiptemplate,
						resizable: false,
						locationObjectName: 'SHAPE',
						locationSpot: go.Spot.Center,
						resizeObjectName: 'SHAPE'
					},
					new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify),
					objGo(go.Panel, 'Spot',
						objGo(go.Shape, 'Diamond', {
							strokeWidth: 1,
							fill: GatewayNodeFill,
							stroke: GatewayNodeStroke,
							name: 'SHAPE',
							desiredSize: new go.Size(GatewayNodeSize / 2, GatewayNodeSize / 2)
						}),
						objGo(go.Shape, 'NotAllowed', {
								alignment: go.Spot.Center,
								stroke: GatewayNodeSymbolStroke,
								strokeWidth: GatewayNodeSymbolStrokeWidth,
								fill: GatewayNodeSymbolFill
							},
							new go.Binding('figure', 'gatewayType', nodeGatewaySymbolTypeConverter),
							// new go.Binding("visible", "gatewayType", function(s) { return s !== 4; }),   // comment out if you want exclusive gateway to be X instead of blank.
							new go.Binding('strokeWidth', 'gatewayType', function(s) {
								return (s <= 4) ? GatewayNodeSymbolStrokeWidth : 1
							}),
							new go.Binding('desiredSize', 'gatewayType', nodePalGatewaySymbolSizeConverter)),
						// the next 2 circles only show up for event gateway
						objGo(go.Shape, 'Circle', // Outer circle
							{
								strokeWidth: 1,
								stroke: GatewayNodeSymbolStroke,
								fill: null,
								desiredSize: new go.Size(EventNodeSize / 2, EventNodeSize / 2)
							},
							// new go.Binding("desiredSize", "gatewayType", new go.Size(EventNodeSize/2, EventNodeSize/2)),
							new go.Binding('visible', 'gatewayType', function(s) {
								return s >= 5
							}) // only visible for > 5
						), // end main shape
						objGo(go.Shape, 'Circle', // Inner circle
							{
								alignment: go.Spot.Center,
								stroke: GatewayNodeSymbolStroke,
								desiredSize: new go.Size(EventNodeInnerSize / 2, EventNodeInnerSize / 2),
								fill: null
							},
							new go.Binding('visible', 'gatewayType', function(s) {
								return s === 5
							}) // inner  only visible for == 5
						)),

					objGo(go.TextBlock, {
							alignment: go.Spot.Center,
							textAlign: 'center',
							margin: 5,
							editable: false
						},
						new go.Binding('text'))
				)

			// --------------------------------------------------------------------------------------------------------------

			const annotationNodeTemplate =
				objGo(go.Node, 'Auto', {
						background: GradientLightGray,
						locationSpot: go.Spot.Center
					},
					new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify),
					objGo(go.Shape, 'Annotation', // A left bracket shape
						{
							portId: '',
							fromLinkable: true,
							cursor: 'pointer',
							fromSpot: go.Spot.Left,
							strokeWidth: 2,
							stroke: 'gray'
						}),
					objGo(go.TextBlock, {
							margin: 5,
							editable: true
						},
						new go.Binding('text').makeTwoWay())
				)

			const dataObjectNodeTemplate =
				objGo(go.Node, 'Vertical', {
						locationObjectName: 'SHAPE',
						locationSpot: go.Spot.Center
					},
					new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify),
					objGo(go.Shape, 'File', {
						name: 'SHAPE',
						portId: '',
						fromLinkable: true,
						toLinkable: true,
						cursor: 'pointer',
						fill: DataFill,
						desiredSize: new go.Size(EventNodeSize * 0.8, EventNodeSize)
					}),
					objGo(go.TextBlock, {
							margin: 5,
							editable: true
						},
						new go.Binding('text').makeTwoWay())
				)

			const dataStoreNodeTemplate =
				objGo(go.Node, 'Vertical', {
						locationObjectName: 'SHAPE',
						locationSpot: go.Spot.Center
					},
					new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify),
					objGo(go.Shape, 'Database', {
						name: 'SHAPE',
						portId: '',
						fromLinkable: true,
						toLinkable: true,
						cursor: 'pointer',
						fill: DataFill,
						desiredSize: new go.Size(EventNodeSize, EventNodeSize)
					}),
					objGo(go.TextBlock, {
							margin: 5,
							editable: true
						},
						new go.Binding('text').makeTwoWay())
				)

			// ------------------------------------------  private process Node Template Map   ----------------------------------------------

			const privateProcessNodeTemplate =
				objGo(go.Node, 'Auto', {
						layerName: 'Background',
						resizable: true,
						resizeObjectName: 'LANE'
					},
					new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify),
					objGo(go.Shape, 'Rectangle', {
						fill: null
					}),
					objGo(go.Panel, 'Table', // table with 2 cells to hold header and lane
						{
							desiredSize: new go.Size(ActivityNodeWidth * 6, ActivityNodeHeight),
							background: DataFill,
							name: 'LANE',
							minSize: new go.Size(ActivityNodeWidth, ActivityNodeHeight * 0.667)
						},
						new go.Binding('desiredSize', 'size', go.Size.parse).makeTwoWay(go.Size.stringify),
						objGo(go.TextBlock, {
								row: 0,
								column: 0,
								angle: 270,
								margin: 5,
								editable: true,
								textAlign: 'center'
							},
							new go.Binding('text').makeTwoWay()),
						objGo(go.RowColumnDefinition, {
							column: 1,
							separatorStrokeWidth: 1,
							separatorStroke: 'black'
						}),
						objGo(go.Shape, 'Rectangle', {
							row: 0,
							column: 1,
							stroke: null,
							fill: 'transparent',
							portId: '',
							fromLinkable: true,
							toLinkable: true,
							fromSpot: go.Spot.TopBottomSides,
							toSpot: go.Spot.TopBottomSides,
							cursor: 'pointer',
							stretch: go.GraphObject.Fill
						})
					)
				)

			const privateProcessNodeTemplateForPalette =
				objGo(go.Node, 'Vertical', {
						locationSpot: go.Spot.Center
					},
					objGo(go.Shape, 'Process', {
						fill: DataFill,
						desiredSize: new go.Size(GatewayNodeSize / 2, GatewayNodeSize / 4)
					}),
					objGo(go.TextBlock, {
							margin: 5,
							editable: true
						},
						new go.Binding('text'))
				)

			const poolTemplateForPalette =
				objGo(go.Group, 'Vertical', {
						locationSpot: go.Spot.Center,
						computesBoundsIncludingLinks: false,
						isSubGraphExpanded: false
					},
					objGo(go.Shape, 'Process', {
						fill: 'white',
						desiredSize: new go.Size(GatewayNodeSize / 2, GatewayNodeSize / 4)
					}),
					objGo(go.Shape, 'Process', {
						fill: 'white',
						desiredSize: new go.Size(GatewayNodeSize / 2, GatewayNodeSize / 4)
					}),
					objGo(go.TextBlock, {
							margin: 5,
							editable: true
						},
						new go.Binding('text'))
				)

			const swimLanesGroupTemplateForPalette =
				objGo(go.Group, 'Vertical') // empty in the palette

			const subProcessGroupTemplate =
				objGo(go.Group, 'Spot', {
						locationSpot: go.Spot.Center,
						locationObjectName: 'PH',
						// locationSpot: go.Spot.Center,
						isSubGraphExpanded: false,
						memberValidation: function(group, part) {
							return !(part instanceof go.Group) ||
								(part.category !== 'Pool' && part.category !== 'Lane')
						},
						mouseDrop: function(e, grp) {
							if (!(grp instanceof go.Group) || grp.diagram === null) return
							const ok = grp.addMembers(grp.diagram.selection, true)
							if (!ok) grp.diagram.currentTool.doCancel()
						},
						contextMenu: activityNodeMenu,
						itemTemplate: boundaryEventItemTemplate
					},
					new go.Binding('itemArray', 'boundaryEventArray'),
					new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify),
					// move a selected part into the Foreground layer, so it isn't obscured by any non-selected parts
					// new go.Binding("layerName", "isSelected", function (s) { return s ? "Foreground" : ""; }).ofObject(),
					objGo(go.Panel, 'Auto',
						objGo(go.Shape, 'RoundedRectangle', {
								name: 'PH',
								fill: SubprocessNodeFill,
								stroke: SubprocessNodeStroke,
								minSize: new go.Size(ActivityNodeWidth, ActivityNodeHeight),
								portId: '',
								fromLinkable: true,
								toLinkable: true,
								cursor: 'pointer',
								fromSpot: go.Spot.RightSide,
								toSpot: go.Spot.LeftSide
							},
							new go.Binding('strokeWidth', 'isCall', function(s) {
								return s ? ActivityNodeStrokeWidthIsCall : ActivityNodeStrokeWidth
							})
						),
						objGo(go.Panel, 'Vertical', {
								defaultAlignment: go.Spot.Left
							},
							objGo(go.TextBlock, // label
								{
									margin: 3,
									editable: true
								},
								new go.Binding('text', 'text').makeTwoWay(),
								new go.Binding('alignment', 'isSubGraphExpanded', function(s) {
									return s ? go.Spot.TopLeft : go.Spot.Center
								})),
							// create a placeholder to represent the area where the contents of the group are
							objGo(go.Placeholder, {
								padding: new go.Margin(5, 5)
							}),
							makeMarkerPanel(true, 1) // sub-process,  loop, parallel, sequential, ad doc and compensation markers
						) // end Vertical Panel
					)
				) // end Group

			// ** need this in the subprocess group template above.
			//        objGo(go.Shape, "RoundedRectangle",  // the inner "Transaction" rounded rectangle
			//          { margin: 3,
			//            stretch: go.GraphObject.Fill,
			//            stroke: ActivityNodeStroke,
			//            parameter1: 8, fill: null, visible: false
			//          },
			//          new go.Binding("visible", "isTransaction")
			//         ),

			function groupStyle() { // common settings for both Lane and Pool Groups
				return [{
						layerName: 'Background', // all pools and lanes are always behind all nodes and links
						background: 'transparent', // can grab anywhere in bounds
						movable: true, // allows users to re-order by dragging
						copyable: false, // can't copy lanes or pools
						avoidable: false // don't impede AvoidsNodes routed Links
					},
					new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify)
				]
			}

			// hide links between lanes when either lane is collapsed
			function updateCrossLaneLinks(group) {
				group.findExternalLinksConnected().each((l) => {
					l.visible = (l.fromNode !== null && l.fromNode.isVisible() && l.toNode !== null && l.toNode.isVisible())
				})
			}

			const laneEventMenu = // context menu for each lane
				objGo('ContextMenu',
					objGo('ContextMenuButton',
						objGo(go.TextBlock, 'Add Lane'),
						// in the click event handler, the obj.part is the Adornment; its adornedObject is the port
						{
							click: function(e, obj) {
								addLaneEvent(obj.part.adornedObject)
							}
						})
				)

			// Add a lane to pool (lane parameter is lane above new lane)
			function addLaneEvent(lane) {
				mySelf.myDiagram.startTransaction('addLane')
				if (lane != null && lane.data.category === 'Lane') {
					// create a new lane data object
					const shape = lane.findObject('SHAPE')
					const size = new go.Size(shape ? shape.width : MINLENGTH, MINBREADTH)
					const newlanedata = {
						category: 'Lane',
						text: 'New Lane',
						color: 'white',
						isGroup: true,
						loc: go.Point.stringify(new go.Point(lane.location.x, lane.location.y + 1)), // place below selection
						size: go.Size.stringify(size),
						group: lane.data.group
					}
					// and add it to the model
					mySelf.myDiagram.model.addNodeData(newlanedata)
				}
				mySelf.myDiagram.commitTransaction('addLane')
			}

			function relayoutDiagram() {
				mySelf.myDiagram.layout.invalidateLayout()
				mySelf.myDiagram.findTopLevelGroups().each(function(g) {
					if (g.category === 'Pool' && g.layout !== null) g.layout.invalidateLayout()
				})
				mySelf.myDiagram.layoutDiagram()
			}

			const swimLanesGroupTemplate =
				objGo(go.Group, 'Spot', groupStyle(), {
						name: 'Lane',
						contextMenu: laneEventMenu,
						minLocation: new go.Point(NaN, -Infinity), // only allow vertical movement
						maxLocation: new go.Point(NaN, Infinity),
						selectionObjectName: 'SHAPE', // selecting a lane causes the body of the lane to be highlit, not the label
						resizable: true,
						resizeObjectName: 'SHAPE', // the custom resizeAdornmentTemplate only permits two kinds of resizing
						layout: objGo(go.LayeredDigraphLayout, // automatically lay out the lane's subgraph
							{
								isInitial: false, // don't even do initial layout
								isOngoing: false, // don't invalidate layout when nodes or links are added or removed
								direction: 0,
								columnSpacing: 10,
								layeringOption: go.LayeredDigraphLayout.LayerLongestPathSource
							}),
						computesBoundsAfterDrag: true, // needed to prevent recomputing Group.placeholder bounds too soon
						computesBoundsIncludingLinks: false, // to reduce occurrences of links going briefly outside the lane
						computesBoundsIncludingLocation: true, // to support empty space at top-left corner of lane
						handlesDragDropForMembers: true, // don't need to define handlers on member Nodes and Links
						mouseDrop: function(e, grp) { // dropping a copy of some Nodes and Links onto this Group adds them to this Group
							// don't allow drag-and-dropping a mix of regular Nodes and Groups
							if (!e.diagram.selection.any((n) => (n instanceof go.Group && n.category !== 'subprocess') || n.category ===
									'privateProcess')) {
								if (!(grp instanceof go.Group) || grp.diagram === null) return
								const ok = grp.addMembers(grp.diagram.selection, true)
								if (ok) {
									updateCrossLaneLinks(grp)
									relayoutDiagram()
								} else {
									grp.diagram.currentTool.doCancel()
								}
							}
						},
						subGraphExpandedChanged: function(grp) {
							if (grp.diagram === null) return
							if (grp.diagram.undoManager.isUndoingRedoing) return
							const shp = grp.resizeObject
							if (grp.isSubGraphExpanded) {
								shp.height = grp['_savedBreadth']
							} else {
								grp['_savedBreadth'] = shp.height
								shp.height = NaN
							}
							updateCrossLaneLinks(grp)
						}
					},
					// new go.Binding("isSubGraphExpanded", "expanded").makeTwoWay(),

					objGo(go.Shape, 'Rectangle', // this is the resized object
						{
							name: 'SHAPE',
							fill: 'white',
							stroke: null
						}, // need stroke null here or you gray out some of pool border.
						new go.Binding('fill', 'color'),
						new go.Binding('desiredSize', 'size', go.Size.parse).makeTwoWay(go.Size.stringify)),

					// the lane header consisting of a Shape and a TextBlock
					objGo(go.Panel, 'Horizontal', {
							name: 'HEADER',
							angle: 270, // maybe rotate the header to read sideways going up
							alignment: go.Spot.LeftCenter,
							alignmentFocus: go.Spot.LeftCenter
						},
						objGo(go.TextBlock, // the lane label
							{
								editable: true,
								margin: new go.Margin(2, 0, 0, 8)
							},
							new go.Binding('visible', 'isSubGraphExpanded').ofObject(),
							new go.Binding('text', 'text').makeTwoWay()),
						objGo('SubGraphExpanderButton', {
							margin: 4,
							angle: -270
						}) // but this remains always visible!
					), // end Horizontal Panel
					objGo(go.Placeholder, {
						padding: 12,
						alignment: go.Spot.TopLeft,
						alignmentFocus: go.Spot.TopLeft
					}),
					objGo(go.Panel, 'Horizontal', {
							alignment: go.Spot.TopLeft,
							alignmentFocus: go.Spot.TopLeft
						},
						objGo(go.TextBlock, // this TextBlock is only seen when the swimlane is collapsed
							{
								name: 'LABEL',
								editable: true,
								visible: false,
								angle: 0,
								margin: new go.Margin(6, 0, 0, 20)
							},
							new go.Binding('visible', 'isSubGraphExpanded', function(e) {
								return !e
							}).ofObject(),
							new go.Binding('text', 'text').makeTwoWay())
					)
				) // end swimLanesGroupTemplate

			// define a custom resize adornment that has two resize handles if the group is expanded
			// mySelf.myDiagram.groupTemplate.resizeAdornmentTemplate =
			swimLanesGroupTemplate.resizeAdornmentTemplate =
				objGo(go.Adornment, 'Spot',
					objGo(go.Placeholder),
					objGo(go.Shape, // for changing the length of a lane
						{
							alignment: go.Spot.Right,
							desiredSize: new go.Size(7, 50),
							fill: 'lightblue',
							stroke: 'dodgerblue',
							cursor: 'col-resize'
						},
						new go.Binding('visible', '', function(ad) {
							if (ad.adornedPart === null) return false
							return ad.adornedPart.isSubGraphExpanded
						}).ofObject()),
					objGo(go.Shape, // for changing the breadth of a lane
						{
							alignment: go.Spot.Bottom,
							desiredSize: new go.Size(50, 7),
							fill: 'lightblue',
							stroke: 'dodgerblue',
							cursor: 'row-resize'
						},
						new go.Binding('visible', '', function(ad) {
							if (ad.adornedPart === null) return false
							return ad.adornedPart.isSubGraphExpanded
						}).ofObject())
				)

			// compute the minimum size of a Pool Group needed to hold all of the Lane Groups
			function computeMinPoolSize(pool) {
				// assert(pool instanceof go.Group && pool.category === "Pool");
				let len = MINLENGTH
				pool.memberParts.each(function(lane) {
					// pools ought to only contain lanes, not plain Nodes
					if (!(lane instanceof go.Group)) return
					const holder = lane.placeholder
					if (holder !== null) {
						const sz = holder.actualBounds
						len = Math.max(len, sz.width)
					}
				})
				return new go.Size(len, NaN)
			}

			// compute the minimum size for a particular Lane Group
			function computeLaneSize(lane) {
				// assert(lane instanceof go.Group && lane.category !== "Pool");
				const sz = computeMinLaneSize(lane)
				if (lane.isSubGraphExpanded) {
					const holder = lane.placeholder
					if (holder !== null) {
						const hsz = holder.actualBounds
						sz.height = Math.max(sz.height, hsz.height)
					}
				}
				// minimum breadth needs to be big enough to hold the header
				const hdr = lane.findObject('HEADER')
				if (hdr !== null) sz.height = Math.max(sz.height, hdr.actualBounds.height)
				return sz
			}

			// determine the minimum size of a Lane Group, even if collapsed
			function computeMinLaneSize(lane) {
				if (!lane.isSubGraphExpanded) return new go.Size(MINLENGTH, 1)
				return new go.Size(MINLENGTH, MINBREADTH)
			}

			// define a custom ResizingTool to limit how far one can shrink a lane Group
			class LaneResizingTool extends go.ResizingTool {
				isLengthening() {
					return (this.handle !== null && this.handle.alignment === go.Spot.Right)
				}

				computeMinSize() {
					if (this.adornedObject === null) return new go.Size(MINLENGTH, MINBREADTH)
					const lane = this.adornedObject.part
					if (!(lane instanceof go.Group) || lane.containingGroup === null) return new go.Size(MINLENGTH, MINBREADTH)
					// assert(lane instanceof go.Group && lane.category !== "Pool");
					const msz = computeMinLaneSize(lane) // get the absolute minimum size
					if (this.isLengthening()) { // compute the minimum length of all lanes
						const sz = computeMinPoolSize(lane.containingGroup)
						msz.width = Math.max(msz.width, sz.width)
					} else { // find the minimum size of this single lane
						const sz = computeLaneSize(lane)
						msz.width = Math.max(msz.width, sz.width)
						msz.height = Math.max(msz.height, sz.height)
					}
					return msz
				}

				canStart() {
					if (!go.ResizingTool.prototype.canStart.call(this)) return false

					// if this is a resize handle for a "Lane", we can start.
					const diagram = this.diagram
					const handl = this.findToolHandleAt(diagram.firstInput.documentPoint, this.name)
					if (handl === null || handl.part === null) return false
					const ad = handl.part
					if (ad.adornedObject === null || ad.adornedObject.part === null) return false
					return (ad.adornedObject.part.category === 'Lane')
				}

				resize(newr) {
					if (this.adornedObject === null) return
					const lane = this.adornedObject.part
					if (lane instanceof go.Group && lane.containingGroup !== null && this.isLengthening()) { // changing the length of all of the lanes
						lane.containingGroup.memberParts.each((l) => {
							if (!(l instanceof go.Group)) return
							const shape = l.resizeObject
							if (shape !== null) { // set its desiredSize length, but leave each breadth alone
								shape.width = newr.width
							}
						})
					} else { // changing the breadth of a single lane
						super.resize.call(this, newr)
					}
					relayoutDiagram() // now that the lane has changed size, layout the pool again
				}
			}

			// end LaneResizingTool class

			// define a custom grid layout that makes sure the length of each lane is the same
			// and that each lane is broad enough to hold its subgraph
			class PoolLayout extends go.GridLayout {
				cellSize = new go.Size(1, 1);
				wrappingColumn = 1;
				wrappingWidth = Infinity;
				isRealtime = false; // don't continuously layout while dragging
				alignment = go.GridLayout.Position;
				// This sorts based on the location of each Group.
				// This is useful when Groups can be moved up and down in order to change their order.
				comparer = function(a, b) {
					const ay = a.location.y
					const by = b.location.y
					if (isNaN(ay) || isNaN(by)) return 0
					if (ay < by) return -1
					if (ay > by) return 1
					return 0
				};

				doLayout(coll) {
					const diagram = this.diagram
					if (diagram === null) return
					diagram.startTransaction('PoolLayout')
					const pool = this.group
					if (pool !== null && pool.category === 'Pool') {
						// make sure all of the Group Shapes are big enough
						const minsize = computeMinPoolSize(pool)
						pool.memberParts.each(function(lane) {
							if (!(lane instanceof go.Group)) return
							if (lane.category !== 'Pool') {
								const shape = lane.resizeObject
								if (shape !== null) { // change the desiredSize to be big enough in both directions
									const sz = computeLaneSize(lane)
									shape.width = (isNaN(shape.width) ? minsize.width : Math.max(shape.width, minsize.width))
									shape.height = (!isNaN(shape.height)) ? Math.max(shape.height, sz.height) : sz.height
									const cell = lane.resizeCellSize
									if (!isNaN(shape.width) && !isNaN(cell.width) && cell.width > 0) shape.width = Math.ceil(shape.width /
										cell.width) * cell.width
									if (!isNaN(shape.height) && !isNaN(cell.height) && cell.height > 0) shape.height = Math.ceil(shape.height /
										cell.height) * cell.height
								}
							}
						})
					}
					// now do all of the usual stuff, according to whatever properties have been set on this GridLayout
					super.doLayout.call(this, coll)
					diagram.commitTransaction('PoolLayout')
				}
			}

			// end PoolLayout class

			const poolGroupTemplate =
				objGo(go.Group, 'Auto', groupStyle(), {
						computesBoundsIncludingLinks: false,
						// use a simple layout that ignores links to stack the "lane" Groups on top of each other
						layout: objGo(PoolLayout, {
							spacing: new go.Size(0, 0)
						}) // no space between lanes
					},
					new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify),
					objGo(go.Shape, {
							fill: 'white'
						},
						new go.Binding('fill', 'color')),
					objGo(go.Panel, 'Table', {
							defaultColumnSeparatorStroke: 'black'
						},
						objGo(go.Panel, 'Horizontal', {
								column: 0,
								angle: 270
							},
							objGo(go.TextBlock, {
									editable: true,
									margin: new go.Margin(5, 0, 5, 0)
								}, // margin matches private process (black box pool)
								new go.Binding('text').makeTwoWay())
						),
						objGo(go.Placeholder, {
							background: 'darkgray',
							column: 1
						})
					)
				) // end poolGroupTemplate

			// ------------------------------------------  Template Maps  ----------------------------------------------

			// create the nodeTemplateMap, holding main view node templates:
			const nodeTemplateMap = new go.Map()
			// for each of the node categories, specify which template to use
			nodeTemplateMap.add('activity', activityNodeTemplate)
			nodeTemplateMap.add('event', eventNodeTemplate)
			nodeTemplateMap.add('gateway', gatewayNodeTemplate)
			nodeTemplateMap.add('annotation', annotationNodeTemplate)
			nodeTemplateMap.add('dataobject', dataObjectNodeTemplate)
			nodeTemplateMap.add('datastore', dataStoreNodeTemplate)
			nodeTemplateMap.add('privateProcess', privateProcessNodeTemplate)
			// for the default category, "", use the same template that Diagrams use by default
			// this just shows the key value as a simple TextBlock

			const groupTemplateMap = new go.Map()
			groupTemplateMap.add('subprocess', subProcessGroupTemplate)
			groupTemplateMap.add('Lane', swimLanesGroupTemplate)
			groupTemplateMap.add('Pool', poolGroupTemplate)

			// create the nodeTemplateMap, holding special palette "mini" node templates:
			const palNodeTemplateMap = new go.Map()
			palNodeTemplateMap.add('activity', activityNodeTemplateForPalette)
			palNodeTemplateMap.add('event', eventNodeTemplate)
			palNodeTemplateMap.add('gateway', gatewayNodeTemplateForPalette)
			palNodeTemplateMap.add('annotation', annotationNodeTemplate)
			palNodeTemplateMap.add('dataobject', dataObjectNodeTemplate)
			palNodeTemplateMap.add('datastore', dataStoreNodeTemplate)
			palNodeTemplateMap.add('privateProcess', privateProcessNodeTemplateForPalette)

			const palGroupTemplateMap = new go.Map()
			palGroupTemplateMap.add('subprocess', subProcessGroupTemplateForPalette)
			palGroupTemplateMap.add('Pool', poolTemplateForPalette)
			palGroupTemplateMap.add('Lane', swimLanesGroupTemplateForPalette)

			// ------------------------------------------BPMN Classes----------------------------------------------

			class PoolLink extends go.Link {
				/**
				 * @hidden @internal
				 */
				getLinkPoint(node, port, spot, from, ortho, othernode, otherport) {
					const r = new go.Rect(port.getDocumentPoint(go.Spot.TopLeft), port.getDocumentPoint(go.Spot.BottomRight))
					const op = super.getLinkPoint(othernode, otherport, spot, from, ortho, node, port)

					const below = op.y > r.centerY
					const y = below ? r.bottom : r.top
					if (node.category === 'privateProcess') {
						if (op.x < r.left) return new go.Point(r.left, y)
						if (op.x > r.right) return new go.Point(r.right, y)
						return new go.Point(op.x, y)
					} else { // otherwise get the standard link point by calling the base class method
						return super.getLinkPoint(node, port, spot, from, ortho, othernode, otherport)
					}
				}

				/**
				 * @hidden @internal
				 * If there are two links from & to same node... and pool is offset in X from node... the link toPoints collide on pool
				 */
				computeOtherPoint(othernode, otherport) {
					const op = super.computeOtherPoint(othernode, otherport)
					let node = this.toNode
					if (node === othernode) node = this.fromNode
					if (node !== null) {
						if (othernode.category === 'privateProcess') {
							op.x = node.getDocumentPoint(go.Spot.MiddleBottom).x
						} else {
							if ((node === this.fromNode) !== (node.actualBounds.centerY < othernode.actualBounds.centerY)) {
								op.x -= 1
							} else {
								op.x += 1
							}
						}
					}
					return op
				}

				/**
				 * @hidden @internal
				 */
				getLinkDirection(node, port, linkpoint, spot, from, ortho, othernode, otherport) {
					if (node.category === 'privateProcess') {
						const p = port.getDocumentPoint(go.Spot.Center)
						const op = otherport.getDocumentPoint(go.Spot.Center)
						const below = op.y > p.y
						return below ? 90 : 270
					} else {
						return super.getLinkDirection.call(this, node, port, linkpoint, spot, from, ortho, othernode, otherport)
					}
				}
			}

			/**
			 * BPMNLinkingTool, a custom linking tool to switch the class of the link created.
			 *
			 * Used in the <a href="../../projects/bpmn/BPMN.html">BPMN extension</a>.
			 * @category Extension
			 */
			class BPMNLinkingTool extends go.LinkingTool {
				constructor() {
					super()
					// don't allow user to create link starting on the To node
					this.direction = go.LinkingTool.ForwardsOnly
					// orthogonal routing during linking
					this.temporaryLink.routing = go.Link.Orthogonal
					// link validation using the validate methods defined below
					this.linkValidation = (fromnode, fromport, tonode, toport) => {
						return BPMNLinkingTool.validateSequenceLinkConnection(fromnode, fromport, tonode, toport) ||
							BPMNLinkingTool.validateMessageLinkConnection(fromnode, fromport, tonode, toport)
					}
				}

				/**
				 * Override {@link LinkingTool#insertLink} to do some extra BPMN-specific processing.
				 */
				insertLink(fromnode, fromport, tonode, toport) {
					let lsave = null
					// maybe temporarily change the link data that is copied to create the new link
					if (BPMNLinkingTool.validateMessageLinkConnection(fromnode, fromport, tonode, toport)) {
						lsave = this.archetypeLinkData
						this.archetypeLinkData = {
							category: 'msg'
						}
					}
					// TODO: task的event没法连线的问题在这里，newlink.fromPortId should be 'be'+a number.
					// create the link in the standard manner by calling the base method
					const newlink = go.LinkingTool.prototype.insertLink.call(this, fromnode, fromport, tonode, toport)

					// maybe make the label visible
					if (newlink !== null && fromnode.category === 'gateway') {
						const label = newlink.findObject('Label')
						if (label !== null) label.visible = true
					}

					// maybe restore the original archetype link data
					if (lsave !== null) this.archetypeLinkData = lsave
					return newlink
				}

				// static utility validation routines for linking & relinking as well as insert link logic

				/**
				 * Validate that sequence links don't cross subprocess or pool boundaries.
				 */
				static validateSequenceLinkConnection(fromnode, fromport, tonode, toport) {
					if (fromnode.category === null || tonode.category === null) return true

					// if either node is in a subprocess, both nodes must be in same subprocess (even for Message Flows)
					if ((fromnode.containingGroup !== null && fromnode.containingGroup.category === 'subprocess') ||
						(tonode.containingGroup !== null && tonode.containingGroup.category === 'subprocess')) {
						if (fromnode.containingGroup !== tonode.containingGroup) return false
					}

					if (fromnode.containingGroup === tonode.containingGroup) return true // a valid Sequence Flow
					// also check for children in common pool
					const common = fromnode.findCommonContainingGroup(tonode)
					return common != null
				}

				/**
				 * Validate that message links cross pool boundaries.
				 */
				static validateMessageLinkConnection(fromnode, fromport, tonode, toport) {
					if (fromnode.category === null || tonode.category === null) return true

					if (fromnode.category === 'privateProcess' || tonode.category === 'privateProcess') return true

					// if either node is in a subprocess, both nodes must be in same subprocess (even for Message Flows)
					if ((fromnode.containingGroup !== null && fromnode.containingGroup.category === 'subprocess') ||
						(tonode.containingGroup !== null && tonode.containingGroup.category === 'subprocess')) {
						if (fromnode.containingGroup !== tonode.containingGroup) return false
					}

					if (fromnode.containingGroup === tonode.containingGroup) return false // an invalid Message Flow

					// also check if fromnode and tonode are in same pool
					const common = fromnode.findCommonContainingGroup(tonode)
					return common === null
				}
			}

			/**
			 * BPMNRelinkingTool, a custom relinking tool to switch the class of the link reconnected.
			 *
			 * Used in the <a href="../../projects/bpmn/BPMN.html">BPMN extension</a>.
			 */
			class BPMNRelinkingTool extends go.RelinkingTool {
				constructor() {
					super()
					// orthogonal routing during linking
					this.temporaryLink.routing = go.Link.Orthogonal
					// link validation using the validate methods defined below
					this.linkValidation = (fromnode, fromport, tonode, toport) => {
						return BPMNLinkingTool.validateSequenceLinkConnection(fromnode, fromport, tonode, toport) ||
							BPMNLinkingTool.validateMessageLinkConnection(fromnode, fromport, tonode, toport)
					}
				}

				/**
				 * Override {@link RelinkingTool#reconnectLink} to do some extra BPMN-specific processing.
				 */
				reconnectLink(existinglink, newnode, newport, toend) {
					const diagram = existinglink.diagram
					if (diagram === null) return false
					const model = diagram.model
					if (model === null) return false

					function recreateLinkData(data, cat) {
						// Copy existing data, then set from, to, and category
						const copy = model.copyLinkData(data)
						copy.from = data.from
						copy.to = data.to
						copy.category = cat
						copy.points = undefined // don't keep points from existing link
						model.removeLinkData(data)
						model.addLinkData(copy)
					}

					if (super.reconnectLink(existinglink, newnode, newport, toend)) {
						const data = existinglink.data
						const fromnode = existinglink.fromNode
						const fromport = existinglink.fromPort
						const tonode = existinglink.toNode
						const toport = existinglink.toPort
						if (fromnode !== null && fromport !== null && tonode !== null && toport !== null) {
							diagram.startTransaction('Relink updates')
							if (BPMNLinkingTool.validateMessageLinkConnection(fromnode, fromport, tonode, toport)) {
								// Recreate the link if the category changed, since it is a different class
								if (existinglink.category !== 'msg') {
									recreateLinkData(data, 'msg')
								}
							}

							// maybe make the label visible
							if (fromnode.category === 'gateway') {
								const label = existinglink.findObject('Label')
								if (label !== null) label.visible = true
							}
							diagram.commitTransaction('Relink updates')
						}
						return true
					}
					return false
				}
			}

			// ------------------------------------------  Link Templates   ----------------------------------------------

			const sequenceLinkTemplate =
				objGo(go.Link, {
						contextMenu: objGo('ContextMenu',
							objGo('ContextMenuButton',
								objGo(go.TextBlock, 'Default Flow'),
								// in the click event handler, the obj.part is the Adornment; its adornedObject is the port
								{
									click: function(e, obj) {
										setSequenceLinkDefaultFlow(obj.part.adornedObject)
									}
								}),
							objGo('ContextMenuButton',
								objGo(go.TextBlock, 'Conditional Flow'),
								// in the click event handler, the obj.part is the Adornment; its adornedObject is the port
								{
									click: function(e, obj) {
										setSequenceLinkConditionalFlow(obj.part.adornedObject)
									}
								})
						),
						routing: go.Link.AvoidsNodes,
						curve: go.Link.JumpGap,
						corner: 10,
						// fromSpot: go.Spot.RightSide, toSpot: go.Spot.LeftSide,
						reshapable: true,
						relinkableFrom: true,
						relinkableTo: true,
						toEndSegmentLength: 20
					},
					new go.Binding('points').makeTwoWay(),
					objGo(go.Shape, {
						stroke: 'black',
						strokeWidth: 1
					}),
					objGo(go.Shape, {
						toArrow: 'Triangle',
						scale: 1.2,
						fill: 'black',
						stroke: null
					}),
					objGo(go.Shape, {
							fromArrow: '',
							scale: 1.5,
							stroke: 'black',
							fill: 'white'
						},
						new go.Binding('fromArrow', 'isDefault', function(s) {
							if (s === null) return ''
							return s ? 'BackSlash' : 'StretchedDiamond'
						}),
						new go.Binding('segmentOffset', 'isDefault', function(s) {
							return s ? new go.Point(5, 0) : new go.Point(0, 0)
						})),
					objGo(go.TextBlock, { // this is a Link label
							name: 'Label',
							editable: true,
							text: 'label',
							segmentOffset: new go.Point(-10, -10),
							visible: false
						},
						new go.Binding('text', 'text').makeTwoWay(),
						new go.Binding('visible', 'visible').makeTwoWay())
				)

			// set Default Sequence Flow (backslash From Arrow)
			function setSequenceLinkDefaultFlow(obj) {
				mySelf.myDiagram.startTransaction('setSequenceLinkDefaultFlow')
				const model = mySelf.myDiagram.model
				model.setDataProperty(obj.data, 'isDefault', true)
				// Set all other links from the fromNode to be isDefault=null
				if (obj.fromNode !== null) {
					obj.fromNode.findLinksOutOf().each(function(link) {
						if (link !== obj && link.data.isDefault) {
							model.setDataProperty(link.data, 'isDefault', null)
						}
					})
				}
				mySelf.myDiagram.commitTransaction('setSequenceLinkDefaultFlow')
			}

			// set Conditional Sequence Flow (diamond From Arrow)
			function setSequenceLinkConditionalFlow(obj) {
				mySelf.myDiagram.startTransaction('setSequenceLinkConditionalFlow')
				const model = mySelf.myDiagram.model
				model.setDataProperty(obj.data, 'isDefault', false)
				mySelf.myDiagram.commitTransaction('setSequenceLinkConditionalFlow')
			}

			const messageFlowLinkTemplate =
				objGo(PoolLink, {
						routing: go.Link.Orthogonal,
						curve: go.Link.JumpGap,
						corner: 10,
						fromSpot: go.Spot.TopBottomSides,
						toSpot: go.Spot.TopBottomSides,
						reshapable: true,
						relinkableTo: true,
						toEndSegmentLength: 20
					},
					new go.Binding('points').makeTwoWay(),
					objGo(go.Shape, {
						stroke: 'black',
						strokeWidth: 1,
						strokeDashArray: [6, 2]
					}),
					objGo(go.Shape, {
						toArrow: 'Triangle',
						scale: 1,
						fill: 'white',
						stroke: 'black'
					}),
					objGo(go.Shape, {
						fromArrow: 'Circle',
						scale: 1,
						visible: true,
						stroke: 'black',
						fill: 'white'
					}),
					objGo(go.TextBlock, {
							editable: true,
							text: 'label'
						}, // Link label
						new go.Binding('text', 'text').makeTwoWay())
				)

			const dataAssociationLinkTemplate =
				objGo(go.Link, {
						routing: go.Link.AvoidsNodes,
						curve: go.Link.JumpGap,
						corner: 10,
						fromSpot: go.Spot.AllSides,
						toSpot: go.Spot.AllSides,
						reshapable: true,
						relinkableFrom: true,
						relinkableTo: true
					},
					new go.Binding('points').makeTwoWay(),
					objGo(go.Shape, {
						stroke: 'black',
						strokeWidth: 1,
						strokeDashArray: [1, 3]
					}),
					objGo(go.Shape, {
						toArrow: 'OpenTriangle',
						scale: 1,
						fill: null,
						stroke: 'blue'
					})
				)

			const annotationAssociationLinkTemplate =
				objGo(go.Link, {
						reshapable: true,
						relinkableFrom: true,
						relinkableTo: true,
						toSpot: go.Spot.AllSides,
						toEndSegmentLength: 20,
						fromEndSegmentLength: 40
					},
					new go.Binding('points').makeTwoWay(),
					objGo(go.Shape, {
						stroke: 'black',
						strokeWidth: 1,
						strokeDashArray: [1, 3]
					}),
					objGo(go.Shape, {
						toArrow: 'OpenTriangle',
						scale: 1,
						stroke: 'black'
					})
				)

			const linkTemplateMap = new go.Map()
			linkTemplateMap.add('msg', messageFlowLinkTemplate)
			linkTemplateMap.add('annotation', annotationAssociationLinkTemplate)
			linkTemplateMap.add('data', dataAssociationLinkTemplate)
			linkTemplateMap.add('', sequenceLinkTemplate) // default

			// ------------------------------------------the main Diagram----------------------------------------------

			class DrawCommandHandler extends go.CommandHandler {
				_arrowKeyBehavior = 'move';
				_pasteOffset = new go.Point(10, 10);
				_lastPasteOffset = new go.Point(0, 0);

				/**
				 * Gets or sets the arrow key behavior. Possible values are "move", "select", and "scroll".
				 *
				 * The default value is "move".
				 */
				get arrowKeyBehavior() {
					return this._arrowKeyBehavior
				}

				set arrowKeyBehavior(val) {
					if (val !== 'move' && val !== 'select' && val !== 'scroll' && val !== 'none') {
						throw new Error(
							'DrawCommandHandler.arrowKeyBehavior must be either "move", "select", "scroll", or "none", not: ' + val)
					}
					this._arrowKeyBehavior = val
				}

				/**
				 * Gets or sets the offset at which each repeated {@link #pasteSelection} puts the new copied parts from the clipboard.
				 */
				get pasteOffset() {
					return this._pasteOffset
				}

				set pasteOffset(val) {
					if (!(val instanceof go.Point)) throw new Error('DrawCommandHandler.pasteOffset must be a Point, not: ' + val)
					this._pasteOffset.set(val)
				}

				/**
				 * This controls whether or not the user can invoke the {@link #alignLeft}, {@link #alignRight},
				 * {@link #alignTop}, {@link #alignBottom}, {@link #alignCenterX}, {@link #alignCenterY} commands.
				 * @return {boolean} This returns true:
				 *                   if the diagram is not {@link Diagram#isReadOnly},
				 *                   if the model is not {@link Model#isReadOnly}, and
				 *                   if there are at least two selected {@link Part}s.
				 */
				canAlignSelection() {
					const diagram = this.diagram
					if (diagram.isReadOnly || diagram.isModelReadOnly) return false
					if (diagram.selection.count < 2) return false
					return true
				}

				/**
				 * Aligns selected parts along the left-most edge of the left-most part.
				 */
				alignLeft() {
					const diagram = this.diagram
					diagram.startTransaction('aligning left')
					let minPosition = Infinity
					diagram.selection.each((current) => {
						if (current instanceof go.Link) return // skips over go.Link
						minPosition = Math.min(current.position.x, minPosition)
					})
					diagram.selection.each((current) => {
						if (current instanceof go.Link) return // skips over go.Link
						current.move(new go.Point(minPosition, current.position.y))
					})
					diagram.commitTransaction('aligning left')
				}

				/**
				 * Aligns selected parts at the right-most edge of the right-most part.
				 */
				alignRight() {
					const diagram = this.diagram
					diagram.startTransaction('aligning right')
					let maxPosition = -Infinity
					diagram.selection.each((current) => {
						if (current instanceof go.Link) return // skips over go.Link
						const rightSideLoc = current.actualBounds.x + current.actualBounds.width
						maxPosition = Math.max(rightSideLoc, maxPosition)
					})
					diagram.selection.each((current) => {
						if (current instanceof go.Link) return // skips over go.Link
						current.move(new go.Point(maxPosition - current.actualBounds.width, current.position.y))
					})
					diagram.commitTransaction('aligning right')
				}

				/**
				 * Aligns selected parts at the top-most edge of the top-most part.
				 */
				alignTop() {
					const diagram = this.diagram
					diagram.startTransaction('alignTop')
					let minPosition = Infinity
					diagram.selection.each((current) => {
						if (current instanceof go.Link) return // skips over go.Link
						minPosition = Math.min(current.position.y, minPosition)
					})
					diagram.selection.each((current) => {
						if (current instanceof go.Link) return // skips over go.Link
						current.move(new go.Point(current.position.x, minPosition))
					})
					diagram.commitTransaction('alignTop')
				}

				/**
				 * Aligns selected parts at the bottom-most edge of the bottom-most part.
				 */
				alignBottom() {
					const diagram = this.diagram
					diagram.startTransaction('aligning bottom')
					let maxPosition = -Infinity
					diagram.selection.each((current) => {
						if (current instanceof go.Link) return // skips over go.Link
						const bottomSideLoc = current.actualBounds.y + current.actualBounds.height
						maxPosition = Math.max(bottomSideLoc, maxPosition)
					})
					diagram.selection.each((current) => {
						if (current instanceof go.Link) return // skips over go.Link
						current.move(new go.Point(current.actualBounds.x, maxPosition - current.actualBounds.height))
					})
					diagram.commitTransaction('aligning bottom')
				}

				/**
				 * Aligns selected parts at the x-value of the center point of the first selected part.
				 */
				alignCenterX() {
					const diagram = this.diagram
					const firstSelection = diagram.selection.first()
					if (!firstSelection) return
					diagram.startTransaction('aligning Center X')
					const centerX = firstSelection.actualBounds.x + firstSelection.actualBounds.width / 2
					diagram.selection.each((current) => {
						if (current instanceof go.Link) return // skips over go.Link
						current.move(new go.Point(centerX - current.actualBounds.width / 2, current.actualBounds.y))
					})
					diagram.commitTransaction('aligning Center X')
				}

				/**
				 * Aligns selected parts at the y-value of the center point of the first selected part.
				 */
				alignCenterY() {
					const diagram = this.diagram
					const firstSelection = diagram.selection.first()
					if (!firstSelection) return
					diagram.startTransaction('aligning Center Y')
					const centerY = firstSelection.actualBounds.y + firstSelection.actualBounds.height / 2
					diagram.selection.each((current) => {
						if (current instanceof go.Link) return // skips over go.Link
						current.move(new go.Point(current.actualBounds.x, centerY - current.actualBounds.height / 2))
					})
					diagram.commitTransaction('aligning Center Y')
				}

				/**
				 * Aligns selected parts top-to-bottom in order of the order selected.
				 * Distance between parts can be specified. Default distance is 0.
				 */
				alignColumn(distance) {
					const diagram = this.diagram
					diagram.startTransaction('align Column')
					if (distance === undefined) distance = 0 // for aligning edge to edge
					distance = parseFloat(distance.toString())
					const selectedParts = []
					diagram.selection.each((current) => {
						if (current instanceof go.Link) return // skips over go.Link
						selectedParts.push(current)
					})
					for (let i = 0; i < selectedParts.length - 1; i++) {
						const current = selectedParts[i]
						// adds distance specified between parts
						const curBottomSideLoc = current.actualBounds.y + current.actualBounds.height + distance
						const next = selectedParts[i + 1]
						next.move(new go.Point(current.actualBounds.x, curBottomSideLoc))
					}
					diagram.commitTransaction('align Column')
				}

				/**
				 * Aligns selected parts left-to-right in order of the order selected.
				 * Distance between parts can be specified. Default distance is 0.
				 */
				alignRow(distance) {
					if (distance === undefined) distance = 0 // for aligning edge to edge
					distance = parseFloat(distance.toString())
					const diagram = this.diagram
					diagram.startTransaction('align Row')
					const selectedParts = []
					diagram.selection.each((current) => {
						if (current instanceof go.Link) return // skips over go.Link
						selectedParts.push(current)
					})
					for (let i = 0; i < selectedParts.length - 1; i++) {
						const current = selectedParts[i]
						// adds distance specified between parts
						const curRightSideLoc = current.actualBounds.x + current.actualBounds.width + distance
						const next = selectedParts[i + 1]
						next.move(new go.Point(curRightSideLoc, current.actualBounds.y))
					}
					diagram.commitTransaction('align Row')
				}

				/**
				 * This controls whether or not the user can invoke the {@link #rotate} command.
				 * @return {boolean} This returns true:
				 *                   if the diagram is not {@link Diagram#isReadOnly},
				 *                   if the model is not {@link Model#isReadOnly}, and
				 *                   if there is at least one selected {@link Part}.
				 */
				canRotate() {
					const diagram = this.diagram
					if (diagram.isReadOnly || diagram.isModelReadOnly) return false
					if (diagram.selection.count < 1) return false
					return true
				}

				/**
				 * Change the angle of the parts connected with the given part. This is in the command handler
				 * so it can be easily accessed for the purpose of creating commands that change the rotation of a part.
				 * @param {number} angle the positive (clockwise) or negative (counter-clockwise) change in the rotation angle of each Part, in degrees.
				 */
				rotate(angle) {
					if (angle === undefined) angle = 90
					const diagram = this.diagram
					diagram.startTransaction('rotate ' + angle.toString())
					diagram.selection.each((current) => {
						if (current instanceof go.Link || current instanceof go.Group) return // skips over Links and Groups
						current.angle += angle
					})
					diagram.commitTransaction('rotate ' + angle.toString())
				}

				/**
				 * This implements custom behaviors for arrow key keyboard events.
				 * Set {@link #arrowKeyBehavior} to "select", "move" (the default), "scroll" (the standard behavior), or "none"
				 * to affect the behavior when the user types an arrow key.
				 */
				doKeyDown() {
					const diagram = this.diagram
					const e = diagram.lastInput

					// determines the function of the arrow keys
					if (e.key === 'Up' || e.key === 'Down' || e.key === 'Left' || e.key === 'Right') {
						const behavior = this.arrowKeyBehavior
						if (behavior === 'none') {
							// no-op
							return
						} else if (behavior === 'select') {
							this._arrowKeySelect()
							return
						} else if (behavior === 'move') {
							this._arrowKeyMove()
							return
						}
						// otherwise drop through to get the default scrolling behavior
					}

					// otherwise still does all standard commands
					super.doKeyDown()
				}

				/**
				 * Collects in an Array all of the non-Link Parts currently in the Diagram.
				 */
				_getAllParts() {
					const allParts = []
					this.diagram.nodes.each((node) => {
						allParts.push(node)
					})
					this.diagram.parts.each((part) => {
						allParts.push(part)
					})
					// note that this ignores Links
					return allParts
				}

				/**
				 * To be called when arrow keys should move the Diagram.selection.
				 */
				_arrowKeyMove() {
					const diagram = this.diagram
					const e = diagram.lastInput
					// moves all selected parts in the specified direction
					let vdistance = 0
					let hdistance = 0
					// if control is being held down, move pixel by pixel. Else, moves by grid cell size
					if (e.control || e.meta) {
						vdistance = 1
						hdistance = 1
					} else if (diagram.grid !== null) {
						const cellsize = diagram.grid.gridCellSize
						hdistance = cellsize.width
						vdistance = cellsize.height
					}
					diagram.startTransaction('arrowKeyMove')
					diagram.selection.each((part) => {
						if (e.key === 'Up') {
							part.move(new go.Point(part.actualBounds.x, part.actualBounds.y - vdistance))
						} else if (e.key === 'Down') {
							part.move(new go.Point(part.actualBounds.x, part.actualBounds.y + vdistance))
						} else if (e.key === 'Left') {
							part.move(new go.Point(part.actualBounds.x - hdistance, part.actualBounds.y))
						} else if (e.key === 'Right') {
							part.move(new go.Point(part.actualBounds.x + hdistance, part.actualBounds.y))
						}
					})
					diagram.commitTransaction('arrowKeyMove')
				}

				/**
				 * To be called when arrow keys should change selection.
				 */
				_arrowKeySelect() {
					const diagram = this.diagram
					const e = diagram.lastInput
					// with a part selected, arrow keys change the selection
					// arrow keys + shift selects the additional part in the specified direction
					// arrow keys + control toggles the selection of the additional part
					let nextPart = null
					if (e.key === 'Up') {
						nextPart = this._findNearestPartTowards(270)
					} else if (e.key === 'Down') {
						nextPart = this._findNearestPartTowards(90)
					} else if (e.key === 'Left') {
						nextPart = this._findNearestPartTowards(180)
					} else if (e.key === 'Right') {
						nextPart = this._findNearestPartTowards(0)
					}
					if (nextPart !== null) {
						if (e.shift) {
							nextPart.isSelected = true
						} else if (e.control || e.meta) {
							nextPart.isSelected = !nextPart.isSelected
						} else {
							diagram.select(nextPart)
						}
					}
				}

				/**
				 * Finds the nearest Part in the specified direction, based on their center points.
				 * if it doesn't find anything, it just returns the current Part.
				 * @param {number} dir the direction, in degrees
				 * @return {Part} the closest Part found in the given direction
				 */
				_findNearestPartTowards(dir) {
					const originalPart = this.diagram.selection.first()
					if (originalPart === null) return null
					const originalPoint = originalPart.actualBounds.center
					const allParts = this._getAllParts()
					let closestDistance = Infinity
					let closest = originalPart // if no parts meet the criteria, the same part remains selected

					for (let i = 0; i < allParts.length; i++) {
						const nextPart = allParts[i]
						if (nextPart === originalPart) continue // skips over currently selected part
						const nextPoint = nextPart.actualBounds.center
						const angle = originalPoint.directionPoint(nextPoint)
						const anglediff = this._angleCloseness(angle, dir)
						if (anglediff <= 45) { // if this part's center is within the desired direction's sector,
							let distance = originalPoint.distanceSquaredPoint(nextPoint)
							distance *= 1 + Math.sin(anglediff * Math.PI / 180) // the more different from the intended angle, the further it is
							if (distance < closestDistance) { // and if it's closer than any other part,
								closestDistance = distance // remember it as a better choice
								closest = nextPart
							}
						}
					}
					return closest
				}

				_angleCloseness(a, dir) {
					return Math.min(Math.abs(dir - a), Math.min(Math.abs(dir + 360 - a), Math.abs(dir - 360 - a)))
				}

				/**
				 * Reset the last offset for pasting.
				 * @param {Iterable.<Part>} coll a collection of {@link Part}s.
				 */
				copyToClipboard(coll) {
					super.copyToClipboard(coll)
					this._lastPasteOffset.set(this.pasteOffset)
				}

				pasteFromClipboard() {
					const coll = super.pasteFromClipboard()
					this.diagram.moveParts(coll, this._lastPasteOffset, false)
					this._lastPasteOffset.add(this.pasteOffset)
					return coll
				}
			}

			mySelf.myDiagram =
				objGo(go.Diagram, 'myDiagramDiv', {
					nodeTemplateMap: nodeTemplateMap,
					linkTemplateMap: linkTemplateMap,
					groupTemplateMap: groupTemplateMap,

					commandHandler: new DrawCommandHandler(), // defined in DrawCommandHandler.js
					// default to having arrow keys move selected nodes
					'commandHandler.arrowKeyBehavior': 'move',

					mouseDrop: function(e) {
						// when the selection is dropped in the diagram's background,
						// make sure the selected Parts no longer belong to any Group
						const ok = mySelf.myDiagram.commandHandler.addTopLevelParts(mySelf.myDiagram.selection, true)
						if (!ok) mySelf.myDiagram.currentTool.doCancel()
					},
					linkingTool: new BPMNLinkingTool(),
					relinkingTool: new BPMNRelinkingTool(),
					'SelectionMoved': relayoutDiagram, // defined below
					'SelectionCopied': relayoutDiagram
				})

			mySelf.myDiagram.toolManager.mouseDownTools.insertAt(0, new LaneResizingTool())

			mySelf.myDiagram.addDiagramListener('LinkDrawn', function(e) {
				if (e.subject.fromNode.category === 'annotation') {
					e.subject.category = 'annotation' // annotation association
				} else if (e.subject.fromNode.category === 'dataobject' || e.subject.toNode.category === 'dataobject') {
					e.subject.category = 'data' // data association
				} else if (e.subject.fromNode.category === 'datastore' || e.subject.toNode.category === 'datastore') {
					e.subject.category = 'data' // data association
				}
			})

			// eslint-disable-next-line no-unused-vars
			var myOwnPropertiesInspector = new Inspector('attributeTable', mySelf.myDiagram, {
				includesOwnProperties: false,
				properties: {
					'from': {
						readOnly: true,
						show: Inspector.showIfLink
					},
					'to': {
						readOnly: true,
						show: Inspector.showIfLink
					},
					'Linktype': {
						readOnly: true,
						show: Inspector.showIfLink
					},
					'category': {
						readOnly: true,
						show: Inspector.showIfNode
					},
					'Name': {
						show: Inspector.showIfNode
					},
					'Annotation': {
						show: Inspector.showIfNode
					},
					'achievedGoal': {
						show: Inspector.showIfNode,
						type: 'select',
						choices: function(node, propName) {
							return mySelf.projectGoals
						}
					},
					'text': {
						show: function(node) {
							return node.category === 'Lane'
						},
						type: 'select',
						choices: function(node, propName) {
							return mySelf.projectRoles
						}
					}
				}
			})
			//  uncomment this if you want a subprocess to expand on drop.  We decided we didn't like this behavior
			//  mySelf.myDiagram.addDiagramListener("ExternalObjectsDropped", function(e) {
			//    // e.subject is the collection that was just dropped
			//    e.subject.each(function(part) {
			//        if (part instanceof go.Node && part.data.item === "end") {
			//          part.move(new go.Point(part.location.x  + 350, part.location.y))
			//        }
			//      });
			//    mySelf.myDiagram.commandHandler.expandSubGraph();
			//  });
			// ------------------------------------------  Palette   ----------------------------------------------

			// Make sure the pipes are ordered by their key in the palette inventory
			function keyCompare(a, b) {
				const at = a.data.key
				const bt = b.data.key
				if (at < bt) return -1
				if (at > bt) return 1
				return 0
			}

			// initialize the first Palette, BPMN Spec Level 1
			const myPaletteDiv1 =
				objGo(go.Palette, 'myPaletteDiv1', { // share the templates with the main Diagram
					nodeTemplateMap: palNodeTemplateMap,
					groupTemplateMap: palGroupTemplateMap,
					layout: objGo(go.GridLayout, {
						cellSize: new go.Size(1, 1),
						spacing: new go.Size(5, 5),
						comparer: keyCompare
					})
				})

			// initialize the second Palette, BPMN Spec Level 2
			const myPaletteDiv2 =
				objGo(go.Palette, 'myPaletteDiv2', { // share the templates with the main Diagram
					nodeTemplateMap: palNodeTemplateMap,
					groupTemplateMap: palGroupTemplateMap,
					layout: objGo(go.GridLayout, {
						cellSize: new go.Size(1, 1),
						spacing: new go.Size(5, 5),
						comparer: keyCompare
					})
				})

			// initialize the third Palette, random other stuff
			const myPaletteDiv3 =
				objGo(go.Palette, 'myPaletteDiv3', { // share the templates with the main Diagram
					nodeTemplateMap: palNodeTemplateMap,
					groupTemplateMap: palGroupTemplateMap,
					layout: objGo(go.GridLayout, {
						cellSize: new go.Size(1, 1),
						spacing: new go.Size(5, 5),
						comparer: keyCompare
					})
				})

			myPaletteDiv1.model = objGo(go.GraphLinksModel, {
				copiesArrays: true,
				copiesArrayObjects: true,
				nodeDataArray: [
					// -------------------------- Event Nodes
					{
						key: 101,
						category: 'event',
						text: '启动',
						eventType: 1,
						eventDimension: 1,
						item: 'start'
					},
					{
						key: 102,
						category: 'event',
						text: '消息启动',
						eventType: 2,
						eventDimension: 2,
						item: 'startMessage'
					}, // BpmnTaskMessage
					{
						key: 103,
						category: 'event',
						text: '定时启动',
						eventType: 3,
						eventDimension: 3,
						item: 'startTimer'
					},
					{
						key: 107,
						category: 'event',
						text: '消息结束',
						eventType: 2,
						eventDimension: 8,
						item: 'endMessage'
					}, // BpmnTaskMessage
					{
						key: 104,
						category: 'event',
						text: '结束',
						eventType: 1,
						eventDimension: 8,
						item: 'End'
					},
					{
						key: 108,
						category: 'event',
						text: '终止结束',
						eventType: 13,
						eventDimension: 8,
						item: 'endTerminate'
					},
					// -------------------------- Task/Activity Nodes
					{
						key: 131,
						category: 'activity',
						text: '任务',
						item: 'generic task',
						taskType: 0
					},
					{
						key: 132,
						category: 'activity',
						text: '用户任务',
						item: 'User task',
						taskType: 2
					},
					{
						key: 133,
						category: 'activity',
						text: '服务任务',
						item: 'service task',
						taskType: 6
					},
					// subprocess and start and end
					{
						key: 134,
						category: 'subprocess',
						loc: '0 0',
						text: '子流程',
						isGroup: true,
						isSubProcess: true,
						taskType: 0,
						item: 'generic subprocess'
					},
					{
						key: -802,
						category: 'event',
						loc: '0 0',
						group: 134,
						text: '启动',
						eventType: 1,
						eventDimension: 1,
						item: 'start'
					},
					{
						key: -803,
						category: 'event',
						loc: '350 0',
						group: 134,
						text: '结束',
						eventType: 1,
						eventDimension: 8,
						item: 'End',
						name: 'end'
					},
					// -------------------------- Gateway Nodes, Data, Pool and Annotation
					{
						key: 201,
						category: 'gateway',
						text: '并行网关',
						gatewayType: 1
					},
					{
						key: 204,
						category: 'gateway',
						text: '排他网关',
						gatewayType: 4
					},
					{
						key: 301,
						category: 'dataobject',
						text: '数据对象'
					},
					{
						key: 302,
						category: 'datastore',
						text: '数据存储'
					},
					{
						key: 401,
						category: 'privateProcess',
						text: '折叠池'
					},
					{
						key: '501',
						text: '池',
						isGroup: 'true',
						category: 'Pool'
					},
					{
						key: 'Lane5',
						text: '泳道 1',
						isGroup: 'true',
						group: '501',
						color: 'lightyellow',
						category: 'Lane'
					},
					{
						key: 'Lane6',
						text: '泳道 2',
						isGroup: 'true',
						group: '501',
						color: 'lightgreen',
						category: 'Lane'
					},
					{
						key: 701,
						category: 'annotation',
						text: ' 注释 '
					}
				] // end nodeDataArray
			}) // end model

			myPaletteDiv2.model = objGo(go.GraphLinksModel, {
				copiesArrays: true,
				copiesArrayObjects: true,
				nodeDataArray: [{
						key: 1,
						category: 'activity',
						taskType: 1,
						text: '接收任务',
						item: 'Receive Task'
					},
					{
						key: 2,
						category: 'activity',
						taskType: 5,
						text: '发送任务',
						item: 'Send Task'
					},
					{
						key: 3,
						category: 'activity',
						taskType: 7,
						text: '业务规则\n任务',
						item: 'Business Rule Task'
					},
					// { key: 4, category: 'activity', taskType: 2, text: 'User Task', item: 'User Task', isCall: true },
					{
						key: 101,
						text: 'Ad-hoc\n子流程',
						isGroup: true,
						isSubProcess: true,
						category: 'subprocess',
						isAdHoc: true,
						taskType: 0,
						loc: '0 0',
						item: 'adhc subprocess'
					},
					{
						key: -812,
						group: 101,
						category: 'event',
						text: '启动',
						eventType: 1,
						eventDimension: 1,
						item: 'start',
						loc: '0 0'
					},
					{
						key: -813,
						group: 101,
						category: 'event',
						text: '结束',
						eventType: 1,
						eventDimension: 8,
						item: 'end',
						name: 'end',
						loc: '350 0'
					},
					{
						key: 102,
						text: '交易\n子流程',
						isGroup: true,
						isSubProcess: true,
						category: 'subprocess',
						isTransaction: true,
						taskType: 0,
						loc: '0 0',
						item: 'transactional subprocess'
					},
					{
						key: -822,
						group: 102,
						category: 'event',
						text: '启动',
						eventType: 1,
						eventDimension: 1,
						item: 'start',
						loc: '0 0'
					},
					{
						key: -823,
						group: 102,
						category: 'event',
						text: '结束',
						eventType: 1,
						eventDimension: 8,
						item: 'end',
						name: 'end',
						loc: '350 0'
					},
					{
						key: 103,
						text: '循环\n子流程',
						isGroup: true,
						isLoop: true,
						isSubProcess: true,
						category: 'subprocess',
						taskType: 0,
						loc: '0 0',
						item: 'looping activity'
					},
					{
						key: -831,
						group: 103,
						category: 'event',
						text: '启动',
						eventType: 1,
						eventDimension: 1,
						item: 'start',
						loc: '0 0'
					},
					{
						key: -832,
						group: 103,
						category: 'event',
						text: '结束',
						eventType: 1,
						eventDimension: 8,
						item: 'end',
						name: 'end',
						loc: '350 0'
					},

					{
						key: 104,
						text: '并行多重\n子流程',
						isGroup: true,
						isSubProcess: true,
						isParallel: true,
						category: 'subprocess',
						taskType: 0,
						loc: '0 0',
						item: 'multi-Instance activity'
					},
					{
						key: -841,
						group: 104,
						category: 'event',
						text: '启动',
						eventType: 1,
						eventDimension: 1,
						item: 'start',
						loc: '0 0'
					},
					{
						key: -842,
						group: 104,
						category: 'event',
						text: '结束',
						eventType: 1,
						eventDimension: 8,
						item: 'end',
						name: 'end',
						loc: '350 0'
					},
					{
						key: 105,
						text: '时序多重\n子流程',
						isGroup: true,
						isSubProcess: true,
						isSequential: true,
						category: 'subprocess',
						taskType: 0,
						loc: '0 0',
						item: 'sequential activity'
					},
					{
						key: -851,
						group: 105,
						category: 'event',
						text: '启动',
						eventType: 1,
						eventDimension: 1,
						item: 'start',
						loc: '0 0'
					},
					{
						key: -852,
						group: 105,
						category: 'event',
						text: '结束',
						eventType: 1,
						eventDimension: 8,
						item: 'end',
						name: 'end',
						loc: '350 0'
					},

					{
						key: 106,
						text: '调用活动',
						category: 'activity',
						isSubProcess: true,
						taskType: 0,
						isCall: true,
						loc: '0 0',
						item: 'call activity'
					},
					// { key: 105, text: 'Call\nSubprocess', category: 'subprocess', isGroup: true,isSubProcess: true,taskType: 0,isCall: true,  loc: '0 0',item:'call subprocess' },
					// { key: -861, group: 105, category: 'event', text: 'Start', eventType: 1, eventDimension: 1, item: 'start', loc: '0 0' },
					// { key: -862, group: 105, category: 'event', text: 'End', eventType: 1, eventDimension: 8, item: 'end', name: 'end', loc: '350 0' },

					// gateway nodes
					{
						key: 301,
						category: 'gateway',
						gatewayType: 2,
						text: '包含网关'
					},
					{
						key: 302,
						category: 'gateway',
						gatewayType: 5,
						text: '时间网关'
					},

					// events
					{
						key: 401,
						category: 'event',
						eventType: 5,
						eventDimension: 1,
						text: '条件启动',
						item: 'BpmnEventConditional'
					},
					{
						key: 402,
						category: 'event',
						eventType: 10,
						eventDimension: 1,
						text: '信号启动',
						item: 'BpmnEventSignal'
					}, // start signal
					{
						key: 403,
						category: 'event',
						eventType: 10,
						eventDimension: 8,
						text: '信号结束',
						item: 'end signal'
					},
					{
						key: 404,
						category: 'event',
						eventType: 7,
						eventDimension: 8,
						text: '错误结束',
						item: 'BpmnEventError'
					},
					{
						key: 405,
						category: 'event',
						eventType: 4,
						eventDimension: 8,
						text: '升级结束',
						item: 'BpmnEventEscalation'
					},
					// throwing / catching intermedicate events
					{
						key: 502,
						category: 'event',
						eventType: 6,
						eventDimension: 4,
						text: '链接中间\n捕获',
						item: 'BpmnEventOffPage'
					},
					{
						key: 503,
						category: 'event',
						eventType: 6,
						eventDimension: 7,
						text: '链接\n中间抛出',
						item: 'BpmnEventOffPage'
					},
					{
						key: 504,
						category: 'event',
						eventType: 2,
						eventDimension: 4,
						text: '消息\n中间捕获',
						item: 'Message'
					},
					{
						key: 505,
						category: 'event',
						eventType: 2,
						eventDimension: 7,
						text: '消息\n中间抛出',
						item: 'Message'
					},
					{
						key: 506,
						category: 'event',
						eventType: 5,
						eventDimension: 4,
						text: '条件\n中间捕获',
						item: ''
					},
					{
						key: 507,
						category: 'event',
						eventType: 3,
						eventDimension: 4,
						text: '定时器\n中间捕获',
						item: ''
					},
					{
						key: 508,
						category: 'event',
						eventType: 4,
						eventDimension: 7,
						text: '升级\n中间抛出',
						item: 'Escalation'
					},
					{
						key: 509,
						category: 'event',
						eventType: 10,
						eventDimension: 4,
						text: '信号\n中间捕获',
						item: ''
					},
					{
						key: 510,
						category: 'event',
						eventType: 10,
						eventDimension: 7,
						text: '信号\n中间抛出',
						item: ''
					}
				] // end nodeDataArray
			}) // end model
			myPaletteDiv3.model = objGo(go.GraphLinksModel, {
				copiesArrays: true,
				copiesArrayObjects: true,
				nodeDataArray: [{
						key: 108,
						category: 'event',
						eventType: 8,
						eventDimension: 5,
						text: 'Cancel',
						item: 'BpmnEventCancel'
					},

					{
						key: 111,
						category: 'event',
						eventType: 11,
						eventDimension: 1,
						text: '多重启动',
						item: 'Multiple'
					},
					{
						key: 112,
						category: 'event',
						eventType: 12,
						eventDimension: 1,
						text: '并行启动',
						item: 'Parallel'
					},

					{
						key: 119,
						category: 'event',
						eventType: 9,
						eventDimension: 5,
						text: '补偿\n中间事件',
						item: 'BpmnEventCompensation'
					},

					// activity nodes
					{
						key: 123,
						category: 'activity',
						taskType: 3,
						text: '手动任务',
						item: 'Manual Task'
					},
					{
						key: 124,
						category: 'activity',
						taskType: 4,
						isSequential: true,
						text: '时序\n脚本任务',
						item: 'Script Task'
					},
					{
						key: 125,
						category: 'activity',
						taskType: 5,
						isParallel: true,
						text: '并行\n发送任务',
						item: 'Send Msg Task'
					},
					{
						key: 126,
						category: 'activity',
						taskType: 6,
						isLoop: true,
						text: '循环\n服务任务',
						item: 'service task'
					},

					// gateway nodes not in Level 1 or Level 2
					{
						key: 163,
						category: 'gateway',
						text: '复杂网关',
						gatewayType: 3
					},
					{
						key: 156,
						category: 'gateway',
						text: '排他开始\n网关',
						gatewayType: 6
					},
					{
						key: 157,
						category: 'gateway',
						text: '并行开始\n网关',
						gatewayType: 7
					}
					,
					{
						key: 4,
						category: 'activity',
						taskType: 2,
						text: 'User Task',
						item: 'User Task',
						isCall: true,
						isLoop: true,
						isParallel: true,
						isSequential: true
					}
				] // end nodeDataArray
			}) // end model

			// ------------------------------------------  Overview   ----------------------------------------------
			objGo(go.Overview, 'diagramOverview', // the HTML DIV element for the Overview
				{
					observed: mySelf.myDiagram,
					contentAlignment: go.Spot.Center
				}) // tell it which Diagram to show and pan

			/* 网格定义 */
			var smallGrid = objGo(go.Panel, 'Grid',
				objGo(go.Shape, 'LineH', {
					stroke: 'lightgray',
					strokeWidth: 0.5
				}),
				objGo(go.Shape, 'LineH', {
					stroke: 'gray',
					strokeWidth: 0.5,
					interval: 3
				}),
				objGo(go.Shape, 'LineV', {
					stroke: 'lightgray',
					strokeWidth: 0.5
				}),
				objGo(go.Shape, 'LineV', {
					stroke: 'gray',
					strokeWidth: 0.5,
					interval: 3
				}))
			var normalGrid = objGo(go.Panel, 'Grid',
				objGo(go.Shape, 'LineH', {
					stroke: 'lightgray',
					strokeWidth: 0.5
				}),
				objGo(go.Shape, 'LineH', {
					stroke: 'gray',
					strokeWidth: 0.5,
					interval: 8
				}),
				objGo(go.Shape, 'LineV', {
					stroke: 'lightgray',
					strokeWidth: 0.5
				}),
				objGo(go.Shape, 'LineV', {
					stroke: 'gray',
					strokeWidth: 0.5,
					interval: 8
				}))
			var bigGrid = objGo(go.Panel, 'Grid',
				objGo(go.Shape, 'LineH', {
					stroke: 'lightgray',
					strokeWidth: 0.5
				}),
				objGo(go.Shape, 'LineH', {
					stroke: 'gray',
					strokeWidth: 0.5,
					interval: 14
				}),
				objGo(go.Shape, 'LineV', {
					stroke: 'lightgray',
					strokeWidth: 0.5
				}),
				objGo(go.Shape, 'LineV', {
					stroke: 'gray',
					strokeWidth: 0.5,
					interval: 14
				}))
			var biggerGrid = objGo(go.Panel, 'Grid',
				objGo(go.Shape, 'LineH', {
					stroke: 'lightgray',
					strokeWidth: 0.5
				}),
				objGo(go.Shape, 'LineH', {
					stroke: 'gray',
					strokeWidth: 0.5,
					interval: 22
				}),
				objGo(go.Shape, 'LineV', {
					stroke: 'lightgray',
					strokeWidth: 0.5
				}),
				objGo(go.Shape, 'LineV', {
					stroke: 'gray',
					strokeWidth: 0.5,
					interval: 22
				}))
			var myGrid = new Map()
			myGrid.set('small-size', smallGrid)
			myGrid.set('normal-size', normalGrid)
			myGrid.set('big-size', bigGrid)
			myGrid.set('bigger-size', biggerGrid)
			this.Grids = myGrid

			mySelf.myDiagram.addModelChangedListener(function(evt) {
				if (evt.isTransactionFinished) {
					mySelf.save()
				}
			})
			// const id = mySelf.$route.query.id
			// mySelf.$ajax.get('api/diagram', {
			// 		params: {
			// 			'diagramId': id
			// 		}
			// 	})
			// 	.then((response) => {
			// 		console.log(response)
			// 		const code = response.data.code
			// 		if (code === 1) {
			// 			mySelf.diagram = response.data.data
			// 			mySelf.load(mySelf.diagram.jsonContent)
			// 			mySelf.folderId = mySelf.diagram.folderId
			// 			mySelf.$ajax.get('api/folder/goals', {
			// 					params: {
			// 						'folderId': mySelf.folderId
			// 					}
			// 				})
			// 				.then((response) => {
			// 					console.log(response)
			// 					const code = response.data.code
			// 					if (code === 1) {
			// 						for (let goal of response.data.data) {
			// 							mySelf.projectGoals.push(goal.Name)
			// 						}
			// 					}
			// 				})
			// 				.catch((error) => {
			// 					console.log(error)
			// 				})
			// 			mySelf.$ajax.get('api/folder/roles', {
			// 					params: {
			// 						'folderId': mySelf.folderId
			// 					}
			// 				})
			// 				.then((response) => {
			// 					console.log(response)
			// 					const code = response.data.code
			// 					if (code === 1) {
			// 						for (let role of response.data.data) {
			// 							mySelf.projectRoles.push(role.Name)
			// 						}
			// 					}
			// 				})
			// 				.catch((error) => {
			// 					console.log(error)
			// 				})
			// 		}
			// 	})
			// 	.catch((error) => {
			// 		console.log(error)
			// 	})
			//var mySelf = this
			const id = this.$route.query.id
			this.curDiagramType = this.$route.query.diagramType
			
			this.$ajax.get('api/diagram', {
			  params: {
			    'diagramId': id
			  }})
			  .then((response) => {
			    console.log("created:",response)
			    const code = response.data.code
			    if (code === 1) {
			     this.diagram = response.data.data
			            console.log("this.diagram new:",this.diagram.jsonContent)
						//console.log("this.diagram:",this.di
			
			    }
			  })
			  .catch((error) => {
			    console.log(error)
			  })
			mySelf.$ajax.get('api/folder')
				.then((response) => {
					console.log(response)
					const code = response.data.code
					if (code === 1) {
						for (let folder of response.data.data) {
							mySelf.folders.push({
								text: folder.folderName,
								value: folder.folderId
							})
						}
					}
				})
				.catch((error) => {
					console.log(error)
				})
		},
		watch: {
			/* grid change */
			flag_showgrid: function(oldSelect, newSelect) {
				if (!this.flag_showgrid || ((typeof this.selectGrid !== 'undefined') && this.selectGrid !== 0 && !this.selectGrid)) {
					this.myDiagram.grid = objGo(go.Panel, 'Grid')
				} else {
					this.myDiagram.grid = this.Grids.get(this.selectGrid)
				}
			},
			selectGrid: function(oldSelect, newSelect) {
				if (!this.flag_showgrid || ((typeof this.selectGrid !== 'undefined') && this.selectGrid !== 0 && !this.selectGrid)) {
					this.myDiagram.grid = objGo(go.Panel, 'Grid')
				} else {
					this.myDiagram.grid = this.Grids.get(this.selectGrid)
				}
			},
			diagram: function(n, o) {
				this.load(n.jsonContent)
				this.moveCanvasCenter()
			}
		},
		methods: {
			
			outportFile() {
				switch (this.selectedFormat) {
					case 'XML':
						{
							let getxml = this.diagram.diagramName + '.xml'
							let temp = JSON.parse(this.myDiagram.model.toJson())
							let xmlText = this.Json2XML(JSON.stringify(temp))
							this.doSave(xmlText, 'text/xml', getxml)
							break
						}
					case 'JSON':
						{
							let temp = JSON.parse(this.myDiagram.model.toJson())
							var getjson = this.diagram.diagramName + '.json'
							this.doSave(JSON.stringify(temp), 'text/latex', getjson)
							break
						}
					case 'PNG':
						{
							var getpng = this.diagram.diagramName + '.png'
							// eslint-disable-next-line one-var
							let bstr = atob(this.myDiagram.makeImageData({
									scale: 2
								}).split(',')[1]),
								n = bstr.length,
								u8arr = new Uint8Array(n)
							while (n--) {
								u8arr[n] = bstr.charCodeAt(n)
							}
							this.doSave(u8arr, 'image/png', getpng)
							break
						}
					case 'RDF':
						{
							var getrdf = this.diagram.diagramName + '.rdf'
							let rdf = this.Json2Rdf()
							this.doSave(rdf, 'text/rdf', getrdf)
							break
						}
					case 'SVG':
						{
							var getsvg = this.diagram.diagramName + '.svg'
							// eslint-disable-next-line one-var
							let bstr = new XMLSerializer().serializeToString(this.myDiagram.makeSvg()),
								n = bstr.length,
								u8arr = new Uint8Array(n)
							while (n--) {
								u8arr[n] = bstr.charCodeAt(n)
							}
							this.doSave(u8arr, 'image/svg+xml', getsvg)
							break
						}
					case 'BPMN':
						{
							let getBPMNxml = this.diagram.diagramName + '.xml'
							let temp = JSON.parse(this.myDiagram.model.toJson())
							let bpmnText = this.Json2BpmnXml(JSON.stringify(temp))
							this.doSave(bpmnText, 'text/xml', getBPMNxml)
							break
						}
				}
			},
			// 通过js的内置对象JSON来进行数组对象的深拷贝
			deepClone2(obj) {
				let _obj = JSON.stringify(obj)
				let objClone = JSON.parse(_obj)
				return objClone
			},
			Json2XML(jsonText) {
				let xotree = new XML.ObjTree()
				let jsonTextWithParent = {
					'myData': JSON.parse(jsonText)
				}
				let xmlText = xotree.writeXML(jsonTextWithParent)
				return xmlText
			},
			Json2BpmnXml(jsontext) {
				let jsonObj = JSON.parse(jsontext)

				let xmlDoc = document.implementation.createDocument(null, null)
				let definitions = xmlDoc.createElement('bpmn:definitions')
				definitions.setAttribute('id', 'my-diagram')
				definitions.setAttribute('xmlns:xsi', 'http://www.w3.org/2001/XMLSchema-instance')
				definitions.setAttribute('xmlns:bpmn', 'http://www.omg.org/spec/BPMN/20100524/MODEL')
				definitions.setAttribute('xmlns:bpmndi', 'http://www.omg.org/spec/BPMN/20100524/DI')
				definitions.setAttribute('xmlns:dc', 'http://www.omg.org/spec/DD/20100524/DC')
				definitions.setAttribute('xmlns:di', 'http://www.omg.org/spec/DD/20100524/DI')
				// definitions.setAttribute("xsi:schemaLocation","http://www.omg.org/spec/BPMN/20100524/MODEL BPMN20.xsd")
				definitions.setAttribute('targetNamespace', 'http://jbpm.org/example/bpmn2')
				definitions.setAttribute('typeLanguage', 'http://www.w3.org/2001/XMLSchema')
				definitions.setAttribute('expressionLanguage', 'http://www.w3.org/1999/XPath')
				xmlDoc.appendChild(definitions)
				// let process = xmlDoc.createElement('bpmn:process')
				// process.setAttribute('id', 'myprocess')
				// process.setAttribute('isExecutable', 'true')
				// definitions.appendChild(process)
				let diagram = xmlDoc.createElement('bpmndi:BPMNDiagram')
				diagram.setAttribute('modelData', jsonObj.modelData.position)
				definitions.appendChild(diagram)
				let BPMNPlane = xmlDoc.createElement('bpmndi:BPMNPlane')
				let linkArray = jsonObj.linkDataArray
				let nodeArray = jsonObj.nodeDataArray
				let mapping = []
				// 生成边的信息sequenceFlow
				let sequenceFlowIdMapping = []
				let linkNum = linkArray.length
				// 是否保存多余信息，0不保存
				let isIncludedOtherInfo = 1

				let poolIDset = []
				let laneIDset = []
				// let isCreatLaneSet = 0
				let isCreatCollaboration = 0
				let collaborationName = null
				let processAndLane = []
				// 创建边ID
				for (let i = 0; i < linkNum; i++) {
					let link = linkArray[i]
					if (link.category === undefined) {
						let name = this.randomName('SequenceFlow')
						sequenceFlowIdMapping.push(name)
					} else {
						sequenceFlowIdMapping.push(link.category + '_' + link.from)
					}
				}
				// console.log(sequenceFlowIdMapping)
				for (let i = 0; i < nodeArray.length; i++) {
					let node = nodeArray[i]
					// console.log( node.category)
					switch (node.category) {
						case 'Pool':
							{
								mapping.push(node.key)
								let participant = xmlDoc.createElement('bpmn:participant')
								participant.setAttribute('id', node.key)
								if (node.text != null) {
									participant.setAttribute('name', node.text)
								}
								let process = xmlDoc.createElement('bpmn:process')
								process.setAttribute('id', node.key + '_process')
								// let pro = [ node.key + '_process']
								// processAndLane.push(pro)
								if (poolIDset.length < 1) {
									process.setAttribute('isExecutable', 'true')
								}
								let laneset = xmlDoc.createElement('bpmn:laneSet')
								laneset.setAttribute('id', this.randomName('laneset'))
								process.appendChild(laneset)
								definitions.insertBefore(process, definitions.getElementsByTagName('bpmndi:BPMNDiagram')[0])
								poolIDset.push(node.key + '_process')
								participant.setAttribute('processRef', node.key + '_process')
								if (isIncludedOtherInfo === 1) {
									participant.setAttribute('category', node.category)
									if (node.isGroup === 'true') {
										participant.setAttribute('isGroup', 'true')
									}
									if (node.Name !== undefined) {
										participant.setAttribute('alias', node.Name)
									}
									if (node.Annotation !== undefined) {
										participant.setAttribute('annotation', node.Annotation)
									}
									if (node.achievedGoal !== undefined) {
										participant.setAttribute('achievedGoal', node.achievedGoal)
									}
								}

								// 保存位置属性
								let BPMNShape = xmlDoc.createElement('bpmndi:BPMNShape')
								BPMNShape.setAttribute('id', node.key + '_di')
								BPMNShape.setAttribute('bpmnElement', node.key)
								BPMNShape.setAttribute('isHorizontal', 'true')
								let bounds = xmlDoc.createElement('dc:Bounds')
								let location = node.loc.toString().split(' ')
								bounds.setAttribute('x', location[0])
								bounds.setAttribute('y', location[1])
								BPMNShape.appendChild(bounds)
								BPMNPlane.appendChild(BPMNShape)

								if (isCreatCollaboration === 0) {
									let collaboration = xmlDoc.createElement('bpmn:collaboration')
									collaborationName = this.randomName('collaboration')
									collaboration.setAttribute('id', collaborationName)
									collaboration.appendChild(participant)
									isCreatCollaboration = 1

									definitions.insertBefore(collaboration, definitions.firstElementChild)
								} else {
									xmlDoc.getElementsByTagName('bpmn:collaboration').item(0).appendChild(participant)
								}
								/* for (let m = 0; m < sequenceFlowIdMapping.length; m++) {
								  if (sequenceFlowIdMapping[m].toString().startsWith('msg')) {
								    let messageFlow = xmlDoc.createElement('bpmn:messageFlow')
								    let msgName = this.randomName('MessageFlow')
								    messageFlow.setAttribute('id', msgName)
								    messageFlow.setAttribute('sourceRef', linkArray[m].from)
								    messageFlow.setAttribute('targetRef', linkArray[m].to)
								    xmlDoc.getElementsByTagName('bpmn:collaboration').item(0).appendChild(messageFlow)
								    // collaboration.appendChild(messageFlow)
								    // 保存位置信息
								    let edge = xmlDoc.createElement('bpmndi:BPMNEdge')
								    edge.setAttribute('id', msgName + '_di')
								    edge.setAttribute('bpmnElement', msgName)
								    let pointSet = linkArray[m].points
								    for (let p = 0; p < pointSet.length; p++) {
								      let loc = xmlDoc.createElement('di:waypoint')
								      loc.setAttribute('x', pointSet[p])
								      p++
								      loc.setAttribute('y', pointSet[p])
								      edge.appendChild(loc)
								    }
								    BPMNPlane.appendChild(edge)
								  }
								} */
								// definitions.appendChild(collaboration)
								break
							}
						case 'privateProcess':
							{
								mapping.push(node.key)
								// console.log(isCreatCollaboration)
								let participant = xmlDoc.createElement('bpmn:participant')
								participant.setAttribute('id', node.key)
								if (node.text != null) {
									participant.setAttribute('name', node.text)
								}
								if (isIncludedOtherInfo === 1) {
									participant.setAttribute('category', node.category)
									if (node.Name !== undefined) {
										participant.setAttribute('alias', node.Name)
									}
									if (node.Annotation !== undefined) {
										participant.setAttribute('annotation', node.Annotation)
									}
									if (node.achievedGoal !== undefined) {
										participant.setAttribute('achievedGoal', node.achievedGoal)
									}
								}
								// 保存位置属性
								let BPMNShape = xmlDoc.createElement('bpmndi:BPMNShape')
								BPMNShape.setAttribute('id', node.key + '_di')
								BPMNShape.setAttribute('bpmnElement', node.key)
								BPMNShape.setAttribute('isHorizontal', 'true')
								let bounds = xmlDoc.createElement('dc:Bounds')
								let location = node.loc.toString().split(' ')
								bounds.setAttribute('x', location[0])
								bounds.setAttribute('y', location[1])
								BPMNShape.appendChild(bounds)
								BPMNPlane.appendChild(BPMNShape)

								if (isCreatCollaboration === 0) {
									let collaboration = xmlDoc.createElement('bpmn:collaboration')
									collaborationName = this.randomName('collaboration')
									collaboration.setAttribute('id', collaborationName)
									collaboration.appendChild(participant)
									// process.appendChild(collaboration)
									// definitions.insertBefore(collaboration, definitions.firstElementChild)
									definitions.insertBefore(collaboration, definitions.firstElementChild)
									isCreatCollaboration = 1
								} else {
									definitions.getElementsByTagName('bpmn:collaboration').item(0).appendChild(participant)
								}

								break
							}
						case 'Lane':
							{
								mapping.push(node.key)
								let lane = xmlDoc.createElement('bpmn:lane')
								lane.setAttribute('id', node.key)
								processAndLane.push(node.key + ' ' + node.group + '_process')
								laneIDset.push(node.key)
								if (node.text != null) {
									lane.setAttribute('name', node.text)
								}
								if (isIncludedOtherInfo === 1) {
									lane.setAttribute('category', node.category)
									if (node.isGroup === 'true') {
										lane.setAttribute('isGroup', 'true')
									}
									if (node.group === undefined) {} else {
										lane.setAttribute('group', node.group.toString())
									}
									if (node.color === undefined) {} else {
										lane.setAttribute('color', node.color.toString())
									}
									if (node.Name !== undefined) {
										lane.setAttribute('alias', node.Name)
									}
									if (node.Annotation !== undefined) {
										lane.setAttribute('annotation', node.Annotation)
									}
									if (node.achievedGoal !== undefined) {
										lane.setAttribute('achievedGoal', node.achievedGoal)
									}
								}

								// 保存位置属性
								let BPMNShape = xmlDoc.createElement('bpmndi:BPMNShape')
								BPMNShape.setAttribute('id', node.key + '_di')
								BPMNShape.setAttribute('bpmnElement', node.key)
								BPMNShape.setAttribute('isHorizontal', 'true')
								let bounds = xmlDoc.createElement('dc:Bounds')
								let location = node.loc.toString().split(' ')
								bounds.setAttribute('x', location[0])
								bounds.setAttribute('y', location[1])
								let size = node.size.toString().split(' ')
								bounds.setAttribute('width', size[0])
								bounds.setAttribute('height', size[1])
								BPMNShape.appendChild(bounds)
								BPMNPlane.appendChild(BPMNShape)

								xmlDoc.getElementById(node.group + '_process').getElementsByTagName('bpmn:laneSet').item(0).appendChild(lane)
								break
							}
						default:
							{
								break
							}
					}
				}

				// 创建bpmndi:BPMNPlane

				if (isCreatCollaboration === 1) {
					BPMNPlane.setAttribute('bpmnElement', collaborationName)
					diagram.appendChild(BPMNPlane)
				} else {
					// BPMNPlane.setAttribute('bpmnElement', 'myprocess')
					diagram.appendChild(BPMNPlane)
				}
				// console.log(laneIDset)

				for (let i = 0; i < nodeArray.length; i++) {
					// console.log('nodeindex', i)
					let node = nodeArray[i]
					// mapping.push(node.key)
					// console.log( node.category)
					let par = 0
					if (node.group !== undefined) {
						for (; par < mapping.length; par++) {
							if (node.group === mapping[par]) {
								break
							}
						}
						if (par === mapping.length && mapping.length !== 0) {
							// console.log('exchange11')
							let beforeNode = this.deepClone2(nodeArray[i])
							let nodep = i + 0
							nodeArray.splice(nodep, 1)
							nodeArray.push(beforeNode)
							// nodeArray[nodep] = nodeArray[nodep + 1]
							// nodeArray[nodep + 1] = beforeNode
							i--
							continue
						}
					}

					if (node.category === 'Pool' || node.category === 'Lane' || node.category === 'privateProcess') {
						continue
					} else {
						mapping.push(node.key)
						switch (node.category) {
							case 'activity':
								{
									let task = xmlDoc.createElement('bpmn:task')

									switch (node.taskType) {
										case 0:
											{
												if (node.isCall === true) {
													task = xmlDoc.createElement('bpmn:callActivity')
													task.setAttribute('calledElement', '')
												}
												// task = xmlDoc.createElement("bpmn:task")
												task.setAttribute('id', node.key)
												if (node.text !== null) {
													task.setAttribute('name', node.text)
												}
												// process.appendChild(task)
												break
											}
										case 1:
											{
												task = xmlDoc.createElement('bpmn:receiveTask')
												task.setAttribute('id', node.key)
												if (node.text !== null) {
													task.setAttribute('name', node.text)
												}
												// process.appendChild(task)
												break
											}
										case 2:
											{
												task = xmlDoc.createElement('bpmn:userTask')
												task.setAttribute('id', node.key)
												if (node.text !== null) {
													task.setAttribute('name', node.text)
												}
												// process.appendChild(task)
												break
											}
										case 3:
											{
												task = xmlDoc.createElement('bpmn:manualTask')
												task.setAttribute('id', node.key)
												if (node.text !== null) {
													task.setAttribute('name', node.text)
												}
												// process.appendChild(task)
												break
											}
										case 4:
											{
												task = xmlDoc.createElement('bpmn:scriptTask')
												task.setAttribute('id', node.key)
												if (node.text !== null) {
													task.setAttribute('name', node.text)
												}
												// process.appendChild(task)
												break
											}
										case 5:
											{
												task = xmlDoc.createElement('bpmn:sendTask')
												task.setAttribute('id', node.key)
												if (node.text !== null) {
													task.setAttribute('name', node.text)
												}
												// process.appendChild(task)
												break
											}
										case 6:
											{
												task = xmlDoc.createElement('bpmn:serviceTask')
												task.setAttribute('id', node.key)
												if (node.text !== null) {
													task.setAttribute('name', node.text)
												}
												// process.appendChild(task)
												break
											}
										case 7:
											{
												task = xmlDoc.createElement('bpmn:businessRuleTask')
												task.setAttribute('id', node.key)
												if (node.text !== null) {
													task.setAttribute('name', node.text)
												}
												// process.appendChild(task)
												break
											}
									}

									if (isIncludedOtherInfo === 1) {
										task.setAttribute('category', node.category)
										task.setAttribute('taskType', node.taskType)
										if (node.item !== undefined) {
											task.setAttribute('item', node.item)
										}
										if (node.isGroup === 'true') {
											task.setAttribute('isGroup', 'true')
										}
										if (node.isCall === true) {
											task.setAttribute('isCall', 'true')
										}
										if (node.group === undefined) {} else {
											task.setAttribute('group', node.group.toString())
										}
										if (node.Name !== undefined) {
											task.setAttribute('alias', node.Name)
										}
										if (node.Annotation !== undefined) {
											task.setAttribute('annotation', node.Annotation)
										}
										if (node.achievedGoal !== undefined) {
											task.setAttribute('achievedGoal', node.achievedGoal)
										}
									}

									if (node.isSequential === true) {
										let multiInstanceLoopCharacteristics = xmlDoc.createElement('bpmn:multiInstanceLoopCharacteristics')
										multiInstanceLoopCharacteristics.setAttribute('isSequential', 'true')
										task.appendChild(multiInstanceLoopCharacteristics)
									}
									if (node.isParallel === true) {
										let multiInstanceLoopCharacteristics = xmlDoc.createElement('bpmn:multiInstanceLoopCharacteristics')
										task.appendChild(multiInstanceLoopCharacteristics)
									}
									if (node.isLoop === true) {
										let standardLoopCharacteristics = xmlDoc.createElement('bpmn:standardLoopCharacteristics')
										task.appendChild(standardLoopCharacteristics)
									}
									let datastoreIn = [] // 记录link中为dataInputAssociation
									let datastoreOut = [] // 记录link中dataOutputAssociation
									for (let j = 0; j < linkArray.length; j++) {
										if (!sequenceFlowIdMapping[j].toString().startsWith('Sequence')) {
											if (sequenceFlowIdMapping[j].toString().startsWith('data')) {
												// console.log('data')
												if (linkArray[j].from.toString() === node.key) {
													datastoreOut.push(j)
												}
												if (linkArray[j].to.toString() === node.key) {
													datastoreIn.push(j)
												}
											}
											continue
										}
										let identFrom = 0
										let identTo = 0
										if (linkArray[j].from.toString() === node.key) {
											identFrom = 1
										}
										if (linkArray[j].to.toString() === node.key) {
											identTo = 1
										}
										if (identFrom === 0 && identTo === 0) {
											continue
										} else {
											if (identFrom === 1) {
												let outgoing = xmlDoc.createElement('bpmn:outgoing')
												outgoing.append(sequenceFlowIdMapping[j].toString())
												task.appendChild(outgoing)
												if (linkArray[j].isDefault === true) {
													task.setAttribute('default', sequenceFlowIdMapping[j].toString())
												}
											}
											if (identTo === 1) {
												let incoming = xmlDoc.createElement('bpmn:incoming')
												incoming.append(sequenceFlowIdMapping[j].toString())
												// task.appendChild(incoming)
												task.insertBefore(incoming, task.firstElementChild)
											}
										}
									}
									// console.log('datastoreIn', datastoreIn.length)
									// console.log('datastoreOut', datastoreOut.length)
									if (datastoreIn.length > 0) {
										// console.log(datastoreIn)
										// let index = parseInt(datastoreIn[0])
										// console.log(link[index].from.toString())
										let property = xmlDoc.createElement('bpmn:property')
										let newid = this.randomName('Property')
										property.setAttribute('id', newid)
										task.appendChild(property)
										for (let inp = 0; inp < datastoreIn.length; inp++) {
											let dataInputAssociation = xmlDoc.createElement('bpmn:dataInputAssociation')
											let msgName = this.randomName('DataInputAssociation')
											dataInputAssociation.setAttribute('id', msgName)
											let sourceRef = xmlDoc.createElement('bpmn:sourceRef')
											sourceRef.append(linkArray[datastoreIn[inp]].from.toString())
											let targetRef = xmlDoc.createElement('bpmn:targetRef')
											targetRef.append(newid)
											dataInputAssociation.appendChild(sourceRef)
											dataInputAssociation.appendChild(targetRef)
											task.appendChild(dataInputAssociation)
											// 保存位置信息
											let edge = xmlDoc.createElement('bpmndi:BPMNEdge')
											edge.setAttribute('id', msgName + '_di')
											edge.setAttribute('bpmnElement', msgName)
											let pointSet = linkArray[datastoreIn[inp]].points
											for (let p = 0; p < pointSet.length; p++) {
												let loc = xmlDoc.createElement('di:waypoint')
												loc.setAttribute('x', pointSet[p])
												p++
												loc.setAttribute('y', pointSet[p])
												edge.appendChild(loc)
											}
											BPMNPlane.appendChild(edge)
										}
									}

									for (let outp = 0; outp < datastoreOut.length; outp++) {
										let dataOutputAssociation = xmlDoc.createElement('bpmn:dataOutputAssociation')
										let newidOut = this.randomName('DataOutputAssociation')
										dataOutputAssociation.setAttribute('id', newidOut)
										let targetRef = xmlDoc.createElement('bpmn:targetRef')
										targetRef.append(linkArray[datastoreOut[outp]].to.toString())
										dataOutputAssociation.appendChild(targetRef)
										task.appendChild(dataOutputAssociation)
										// 保存位置信息
										let edge = xmlDoc.createElement('bpmndi:BPMNEdge')
										edge.setAttribute('id', newidOut + '_di')
										edge.setAttribute('bpmnElement', newidOut)
										let pointSet = linkArray[datastoreOut[outp]].points
										for (let p = 0; p < pointSet.length; p++) {
											let loc = xmlDoc.createElement('di:waypoint')
											loc.setAttribute('x', pointSet[p])
											p++
											loc.setAttribute('y', pointSet[p])
											edge.appendChild(loc)
										}
										BPMNPlane.appendChild(edge)
									}
									let belongToLane = false
									// let belongToLaneID = ''
									// console.log(laneIDset)
									for (let g = 0; g < laneIDset.length; g++) {
										if (node.group === laneIDset[g]) {
											belongToLane = true
											g = laneIDset.length
										}
									}
									let currentProcess = ''
									for (let p = 0; p < processAndLane.length; p++) {
										if (node.group === processAndLane[p].toString().split(' ')[0]) {
											currentProcess = processAndLane[p].toString().split(' ')[1]
										}
									}
									if (node.boundaryEventArray === undefined) {

									} else {
										let boundaryArray = node.boundaryEventArray
										for (let b = 0; b < boundaryArray.length; b++) {
											let boundary = xmlDoc.createElement('bpmn:boundaryEvent')
											boundary.setAttribute('id', this.randomName('IntermediateThrowEvent'))
											boundary.setAttribute('attachedToRef', node.key)
											if (isIncludedOtherInfo === 1) {
												boundary.setAttribute('eventType', boundaryArray[b].eventType)
												boundary.setAttribute('eventDimension', boundaryArray[b].eventDimension)
												boundary.setAttribute('portId', boundaryArray[b].portId)
												boundary.setAttribute('alignmentIndex', boundaryArray[b].alignmentIndex)
											}
											switch (boundaryArray[b].eventType) {
												case 2:
													{
														let messageEventDefinition = xmlDoc.createElement('bpmn:messageEventDefinition')
														boundary.appendChild(messageEventDefinition)
														break
													}
												case 3:
													{
														let timerEventDefinition = xmlDoc.createElement('bpmn:timerEventDefinition')
														boundary.appendChild(timerEventDefinition)
														break
													}
												case 4:
													{
														let escalationEventDefinition = xmlDoc.createElement('bpmn:escalationEventDefinition')
														boundary.appendChild(escalationEventDefinition)
														if (boundaryArray[b].eventDimension === 6) {
															boundary.setAttribute('cancelActivity', 'false')
														}
														break
													}
												case 7:
													{
														let errorEventDefinition = xmlDoc.createElement('bpmn:errorEventDefinition')
														boundary.appendChild(errorEventDefinition)
														break
													}
												case 10:
													{
														let signalEventDefinition = xmlDoc.createElement('bpmn:signalEventDefinition')
														boundary.appendChild(signalEventDefinition)
														break
													}
											}
											if (belongToLane === true) {
												let flowNodeRef = xmlDoc.createElement('bpmn:flowNodeRef')
												flowNodeRef.append(node.key)
												xmlDoc.getElementById(node.group).appendChild(flowNodeRef)
												xmlDoc.getElementById(currentProcess).insertBefore(boundary, xmlDoc.getElementById(currentProcess).getElementsByTagName(
													'bpmn:sequenceFlow')[0])
											} else {
												if (node.group !== undefined) {
													xmlDoc.getElementById(node.group).appendChild(boundary)
												} else {
													definitions.insertBefore(boundary, definitions.getElementsByTagName('bpmndi:BPMNDiagram')[0])
													// process.appendChild(boundary)
												}
											}
										}
									}
									if (belongToLane === true) {
										let flowNodeRef = xmlDoc.createElement('bpmn:flowNodeRef')
										flowNodeRef.append(node.key)
										xmlDoc.getElementById(node.group).appendChild(flowNodeRef)
										xmlDoc.getElementById(currentProcess).insertBefore(task, xmlDoc.getElementById(currentProcess).getElementsByTagName(
											'bpmn:sequenceFlow')[0])
									} else {
										if (node.group !== undefined) {
											xmlDoc.getElementById(node.group).appendChild(task)
										} else {
											definitions.insertBefore(task, definitions.getElementsByTagName('bpmndi:BPMNDiagram')[0])
											// process.appendChild(task)
										}
									}
									// 创建形状属性
									let BPMNShape = xmlDoc.createElement('bpmndi:BPMNShape')
									BPMNShape.setAttribute('id', node.key + '_di')
									BPMNShape.setAttribute('bpmnElement', node.key)
									let bounds = xmlDoc.createElement('dc:Bounds')
									let location = node.loc.toString().split(' ')
									bounds.setAttribute('x', location[0])
									bounds.setAttribute('y', location[1])
									BPMNShape.appendChild(bounds)
									BPMNPlane.appendChild(BPMNShape)
									break
								}
							case 'event':
								{
									let event = xmlDoc.createElement('bpmn:startEvent')
									switch (node.eventType) {
										case 1:
											{
												if (node.eventDimension === 1) {
													event = xmlDoc.createElement('bpmn:startEvent')
													event.setAttribute('id', node.key)
													if (node.text !== null) {
														event.setAttribute('name', node.text)
													}
													// process.appendChild(event)
													break
												}
												if (node.eventDimension === 8) {
													event = xmlDoc.createElement('bpmn:endEvent')
													event.setAttribute('id', node.key)
													if (node.text !== null) {
														event.setAttribute('name', node.text)
													}
													// process.appendChild(event)
													break
												}
												break
											}
										case 2:
											{
												if (node.eventDimension === 2) {
													event = xmlDoc.createElement('bpmn:startEvent')
													event.setAttribute('id', node.key)
													if (node.text !== null) {
														event.setAttribute('name', node.text)
													}
													let messageEventDefinition = xmlDoc.createElement('bpmn:messageEventDefinition')
													event.appendChild(messageEventDefinition)
													// process.appendChild(event)
													break
												}
												if (node.eventDimension === 8) {
													event = xmlDoc.createElement('bpmn:endEvent')
													event.setAttribute('id', node.key)
													if (node.text !== null) {
														event.setAttribute('name', node.text)
													}
													let messageEventDefinition = xmlDoc.createElement('bpmn:messageEventDefinition')
													event.appendChild(messageEventDefinition)
													// process.appendChild(event)
													break
												}
												if (node.eventDimension === 4) {
													event = xmlDoc.createElement('bpmn:intermediateCatchEvent')
													event.setAttribute('id', node.key)
													if (node.text !== null) {
														event.setAttribute('name', node.text)
													}

													let message = xmlDoc.createElement('bpmn:message')
													let messageID = this.randomName('Message')
													let messageNAME = this.randomName('Message')
													message.setAttribute('id', messageID)
													message.setAttribute('name', messageNAME)
													definitions.insertBefore(message, definitions.getElementsByTagName('bpmndi:BPMNDiagram')[0])
													let messageEventDefinition = xmlDoc.createElement('bpmn:messageEventDefinition')
													messageEventDefinition.setAttribute('messageRef', messageID)
													event.appendChild(messageEventDefinition)
												}
												if (node.eventDimension === 7) {
													event = xmlDoc.createElement('bpmn:intermediateThrowEvent')
													event.setAttribute('id', node.key)
													if (node.text !== null) {
														event.setAttribute('name', node.text)
													}
													let message = xmlDoc.createElement('bpmn:message')
													let messageID = this.randomName('Message')
													let messageNAME = this.randomName('Message')
													message.setAttribute('id', messageID)
													message.setAttribute('name', messageNAME)
													definitions.insertBefore(message, definitions.getElementsByTagName('bpmndi:BPMNDiagram')[0])
													let messageEventDefinition = xmlDoc.createElement('bpmn:messageEventDefinition')
													messageEventDefinition.setAttribute('messageRef', messageID)
													event.appendChild(messageEventDefinition)
												}
												break
											}
										case 3:
											{
												if (node.eventDimension === 3) {
													event = xmlDoc.createElement('bpmn:startEvent')
													event.setAttribute('id', node.key)
													if (node.text !== null) {
														event.setAttribute('name', node.text)
													}
													let timerEventDefinition = xmlDoc.createElement('bpmn:timerEventDefinition')
													event.appendChild(timerEventDefinition)
													// process.appendChild(event)
													break
												}
												if (node.eventDimension === 4) {
													event = xmlDoc.createElement('bpmn:intermediateCatchEvent')
													event.setAttribute('id', node.key)
													if (node.text !== null) {
														event.setAttribute('name', node.text)
													}
													let timerEventDefinition = xmlDoc.createElement('bpmn:timerEventDefinition')
													// let  = xmlDoc.createElement("bpmn:condition ")
													// condition.setAttribute("xsi:type",null)
													// conditionalEventDefinition.appendChild(condition)
													event.appendChild(timerEventDefinition)
												}
												break
											}
										case 4:
											{
												if (node.eventDimension === 8) {
													event = xmlDoc.createElement('bpmn:endEvent')
													event.setAttribute('id', node.key)
													if (node.text !== null) {
														event.setAttribute('name', node.text)
													}

													let escalation = xmlDoc.createElement('bpmn:escalation')
													let escalationID = this.randomName('Eescalation')
													let escalationNAME = this.randomName('Eescalation')
													escalation.setAttribute('id', escalationID)
													escalation.setAttribute('name', escalationNAME)
													definitions.insertBefore(escalation, definitions.getElementsByTagName('bpmndi:BPMNDiagram')[0])

													let escalationEventDefinition = xmlDoc.createElement('bpmn:escalationEventDefinition')
													escalationEventDefinition.setAttribute('escalationRef', escalationID)
													event.appendChild(escalationEventDefinition)
													// process.appendChild(event)
													break
												}
												if (node.eventDimension === 7) {
													event = xmlDoc.createElement('bpmn:intermediateThrowEvent')
													event.setAttribute('id', node.key)
													if (node.text !== null) {
														event.setAttribute('name', node.text)
													}
													let escalation = xmlDoc.createElement('bpmn:escalation')
													let escalationID = this.randomName('Eescalation')
													let escalationNAME = this.randomName('Eescalation')
													escalation.setAttribute('id', escalationID)
													escalation.setAttribute('name', escalationNAME)
													definitions.insertBefore(escalation, definitions.getElementsByTagName('bpmndi:BPMNDiagram')[0])

													let escalationEventDefinition = xmlDoc.createElement('bpmn:escalationEventDefinition')
													escalationEventDefinition.setAttribute('escalationRef', escalationID)
													event.appendChild(escalationEventDefinition)
													// process.appendChild(event)
													break
												}
												break
											}
										case 5:
											{
												if (node.eventDimension === 1) {
													event = xmlDoc.createElement('bpmn:startEvent')
													event.setAttribute('id', node.key)
													if (node.text !== null) {
														event.setAttribute('name', node.text)
													}
													let conditionalEventDefinition = xmlDoc.createElement('bpmn:conditionalEventDefinition')
													let condition = xmlDoc.createElement('bpmn:condition')
													condition.setAttribute('xsi:type', null)
													conditionalEventDefinition.appendChild(condition)
													event.appendChild(conditionalEventDefinition)
													// process.appendChild(event)
													break
												}
												if (node.eventDimension === 4) {
													event = xmlDoc.createElement('bpmn:intermediateCatchEvent')
													event.setAttribute('id', node.key)
													if (node.text != null) {
														event.setAttribute('name', node.text)
													}
													let conditionalEventDefinition = xmlDoc.createElement('bpmn:conditionalEventDefinition')
													let condition = xmlDoc.createElement('bpmn:condition')
													condition.setAttribute('xsi:type', null)
													conditionalEventDefinition.appendChild(condition)
													event.appendChild(conditionalEventDefinition)
												}
												break
											}
										case 6:
											{
												if (node.eventDimension === 4) {
													event = xmlDoc.createElement('bpmn:intermediateCatchEvent')
													event.setAttribute('id', node.key)
													if (node.text !== null) {
														event.setAttribute('name', node.text)
													}
													let linkEventDefinition = xmlDoc.createElement('bpmn:linkEventDefinition')
													// linkEventDefinition.setAttribute("name",this.randomName(""))
													event.appendChild(linkEventDefinition)
													break
												}
												if (node.eventDimension === 7) {
													event = xmlDoc.createElement('bpmn:intermediateThrowEvent')
													event.setAttribute('id', node.key)
													if (node.text !== null) {
														event.setAttribute('name', node.text)
													}
													let linkEventDefinition = xmlDoc.createElement('bpmn:linkEventDefinition')
													// linkEventDefinition.setAttribute("name",this.randomName(""))
													event.appendChild(linkEventDefinition)
													break
												}
												break
											}
										case 7:
											{
												if (node.eventDimension === 8) {
													event = xmlDoc.createElement('bpmn:endEvent')
													event.setAttribute('id', node.key)
													if (node.text !== null) {
														event.setAttribute('name', node.text)
													}

													let error = xmlDoc.createElement('bpmn:error')
													let errorID = this.randomName('Error')
													let errorNAME = this.randomName('Error')
													error.setAttribute('id', errorID)
													error.setAttribute('name', errorNAME)
													definitions.insertBefore(error, definitions.getElementsByTagName('bpmndi:BPMNDiagram')[0])

													let errorEventDefinition = xmlDoc.createElement('bpmn:errorEventDefinition')
													errorEventDefinition.setAttribute('errorRef', errorID)
													event.appendChild(errorEventDefinition)
													// process.appendChild(event)
													break
												}
												break
											}
										case 8:
											{
												if (node.eventDimension === 5) {
													event = xmlDoc.createElement('bpmn:endEvent')
													event.setAttribute('id', node.key)
													if (node.text !== null) {
														event.setAttribute('name', node.text)
													}
													let compensateEventDefinition = xmlDoc.createElement('bpmn: cancelEventDefinition')
													// linkEventDefinition.setAttribute("name",this.randomName(""))
													event.appendChild(compensateEventDefinition)
													break
												}
												break
											}
										case 9:
											{
												if (node.eventDimension === 5) {
													event = xmlDoc.createElement('bpmn:intermediateThrowEvent')
													event.setAttribute('id', node.key)
													if (node.text !== null) {
														event.setAttribute('name', node.text)
													}
													let compensateEventDefinition = xmlDoc.createElement('bpmn:compensateEventDefinition')
													// linkEventDefinition.setAttribute("name",this.randomName(""))
													event.appendChild(compensateEventDefinition)
													break
												}
												break
											}
										case 10:
											{
												if (node.eventDimension === 1) {
													event = xmlDoc.createElement('bpmn:startEvent')
													event.setAttribute('id', node.key)
													if (node.text !== null) {
														event.setAttribute('name', node.text)
													}

													let signal = xmlDoc.createElement('bpmn:signal')
													let signalID = this.randomName('Signal')
													let signalNAME = this.randomName('Signal')
													signal.setAttribute('id', signalID)
													signal.setAttribute('name', signalNAME)
													definitions.insertBefore(signal, definitions.getElementsByTagName('bpmndi:BPMNDiagram')[0])

													let signalEventDefinition = xmlDoc.createElement('bpmn:signalEventDefinition')
													signalEventDefinition.setAttribute('signalRef', signalID)
													event.appendChild(signalEventDefinition)
													// process.appendChild(event)
													break
												}
												if (node.eventDimension === 8) {
													event = xmlDoc.createElement('bpmn:endEvent')
													event.setAttribute('id', node.key)
													if (node.text != null) {
														event.setAttribute('name', node.text)
													}

													let signal = xmlDoc.createElement('bpmn:signal')
													let signalID = this.randomName('Signal')
													let signalNAME = this.randomName('Signal')
													signal.setAttribute('id', signalID)
													signal.setAttribute('name', signalNAME)
													definitions.insertBefore(signal, definitions.getElementsByTagName('bpmndi:BPMNDiagram')[0])

													let signalEventDefinition = xmlDoc.createElement('bpmn:signalEventDefinition')
													signalEventDefinition.setAttribute('signalRef', signalID)
													event.appendChild(signalEventDefinition)
													// process.appendChild(event)
													break
												}
												if (node.eventDimension === 4) {
													event = xmlDoc.createElement('bpmn:intermediateCatchEvent')
													event.setAttribute('id', node.key)
													if (node.text !== null) {
														event.setAttribute('name', node.text)
													}
													let signal = xmlDoc.createElement('bpmn:signal')
													let signalID = this.randomName('Signal')
													let signalNAME = this.randomName('Signal')
													signal.setAttribute('id', signalID)
													signal.setAttribute('name', signalNAME)
													definitions.insertBefore(signal, definitions.getElementsByTagName('bpmndi:BPMNDiagram')[0])

													let signalEventDefinition = xmlDoc.createElement('bpmn:signalEventDefinition')
													signalEventDefinition.setAttribute('signalRef', signalID)
													event.appendChild(signalEventDefinition)
													// process.appendChild(event)
													break
												}
												if (node.eventDimension === 7) {
													event = xmlDoc.createElement('bpmn:intermediateThrowEvent')
													event.setAttribute('id', node.key)
													if (node.text !== null) {
														event.setAttribute('name', node.text)
													}
													let signal = xmlDoc.createElement('bpmn:signal')
													let signalID = this.randomName('Signal')
													let signalNAME = this.randomName('Signal')
													signal.setAttribute('id', signalID)
													signal.setAttribute('name', signalNAME)
													definitions.insertBefore(signal, definitions.getElementsByTagName('bpmndi:BPMNDiagram')[0])

													let signalEventDefinition = xmlDoc.createElement('bpmn:signalEventDefinition')
													signalEventDefinition.setAttribute('signalRef', signalID)
													event.appendChild(signalEventDefinition)
													// process.appendChild(event)
													break
												}
												break
											}
										case 11:
											{
												if (node.eventDimension === 1) {
													event = xmlDoc.createElement('bpmn:startEvent')
													event.setAttribute('id', node.key)
													if (node.text !== null) {
														event.setAttribute('name', node.text)
													}
													// process.appendChild(event)
													break
												}
												break
											}
										case 12:
											{
												if (node.eventDimension === 1) {
													event = xmlDoc.createElement('bpmn:startEvent')
													event.setAttribute('id', node.key)
													if (node.text !== null) {
														event.setAttribute('name', node.text)
													}
													event.setAttribute('parallelMultiple', 'true')
													// process.appendChild(event)
													break
												}
												break
											}
										case 13:
											{
												if (node.eventDimension === 8) {
													event = xmlDoc.createElement('bpmn:endEvent')
													event.setAttribute('id', node.key)
													if (node.text !== null) {
														event.setAttribute('name', node.text)
													}
													let terminateEventDefinition = xmlDoc.createElement('bpmn:terminateEventDefinition')
													event.appendChild(terminateEventDefinition)
													// process.appendChild(event)
													break
												}
											}
									}
									if (isIncludedOtherInfo === 1) {
										event.setAttribute('category', node.category)
										event.setAttribute('eventType', node.eventType)
										event.setAttribute('eventDimension', node.eventDimension)
										if (node.item !== undefined) {
											event.setAttribute('item', node.item)
										}
										if (node.isGroup === 'true') {
											event.setAttribute('isGroup', 'true')
										}
										if (node.group === undefined) {} else {
											event.setAttribute('group', node.group.toString())
										}
										if (node.Name !== undefined) {
											event.setAttribute('alias', node.Name)
										}
										if (node.Annotation !== undefined) {
											event.setAttribute('annotation', node.Annotation)
										}
										if (node.achievedGoal !== undefined) {
											event.setAttribute('achievedGoal', node.achievedGoal)
										}
									}

									let datastoreIn = [] // 记录link中为dataInputAssociation
									let datastoreOut = [] // 记录link中dataOutputAssociation
									for (let j = 0; j < linkArray.length; j++) {
										if (!sequenceFlowIdMapping[j].toString().startsWith('Sequence')) {
											if (sequenceFlowIdMapping[j].toString().startsWith('datastore') || sequenceFlowIdMapping[j].toString().startsWith(
													'dataobject')) {
												if (linkArray[j].from.toString() === node.key) {
													datastoreOut.push(j)
												}
												if (linkArray[j].to.toString() === node.key) {
													datastoreIn.push(j)
												}
											}
											continue
										}
										let identFrom = 0
										let identTo = 0
										if (linkArray[j].from.toString() === node.key) {
											identFrom = 1
										}
										if (linkArray[j].to.toString() === node.key) {
											identTo = 1
										}
										if (identFrom === 0 && identTo === 0) {
											continue
										} else {
											if (identFrom === 1) {
												let outgoing = xmlDoc.createElement('bpmn:outgoing')
												outgoing.append(sequenceFlowIdMapping[j].toString())
												event.appendChild(outgoing)
											}
											if (identTo === 1) {
												let incoming = xmlDoc.createElement('bpmn:incoming')
												incoming.append(sequenceFlowIdMapping[j].toString())
												event.appendChild(incoming)
											}
										}
									}
									if (datastoreIn.length > 0) {
										let property = xmlDoc.createElement('bpmn:property')
										let newid = this.randomName('Property')
										property.setAttribute('id', newid)
										event.appendChild(property)

										for (let inp = 0; inp < datastoreIn.length; inp++) {
											let dataInputAssociation = xmlDoc.createElement('bpmn:dataInputAssociation')
											let msgName = this.randomName('DataInputAssociation')
											dataInputAssociation.setAttribute('id', msgName)
											let sourceRef = xmlDoc.createElement('bpmn:sourceRef')
											sourceRef.append(linkArray[datastoreIn[inp]].from.toString())
											let targetRef = xmlDoc.createElement('bpmn:targetRef')
											targetRef.append(newid)
											dataInputAssociation.appendChild(sourceRef)
											dataInputAssociation.appendChild(targetRef)
											event.appendChild(dataInputAssociation)
											// 保存位置信息
											let edge = xmlDoc.createElement('bpmndi:BPMNEdge')
											edge.setAttribute('id', msgName + '_di')
											edge.setAttribute('bpmnElement', msgName)
											let pointSet = linkArray[datastoreIn[inp]].points
											for (let p = 0; p < pointSet.length; p++) {
												let loc = xmlDoc.createElement('di:waypoint')
												loc.setAttribute('x', pointSet[p])
												p++
												loc.setAttribute('y', pointSet[p])
												edge.appendChild(loc)
											}
											BPMNPlane.appendChild(edge)
										}
									}

									for (let outp = 0; outp < datastoreOut.length; outp++) {
										let dataOutputAssociation = xmlDoc.createElement('bpmn:dataOutputAssociation')
										let newidOut = this.randomName('DataOutputAssociation')
										dataOutputAssociation.setAttribute('id', newidOut)
										let targetRef = xmlDoc.createElement('bpmn:targetRef')
										targetRef.append(linkArray[datastoreOut[outp]].to.toString())
										dataOutputAssociation.appendChild(targetRef)
										event.appendChild(dataOutputAssociation)
										// 保存位置信息
										let edge = xmlDoc.createElement('bpmndi:BPMNEdge')
										edge.setAttribute('id', newidOut + '_di')
										edge.setAttribute('bpmnElement', newidOut)
										let pointSet = linkArray[datastoreOut[outp]].points
										for (let p = 0; p < pointSet.length; p++) {
											let loc = xmlDoc.createElement('di:waypoint')
											loc.setAttribute('x', pointSet[p])
											p++
											loc.setAttribute('y', pointSet[p])
											edge.appendChild(loc)
										}
										BPMNPlane.appendChild(edge)
									}
									let belongToLane = false
									for (let g = 0; g < laneIDset.length; g++) {
										if (node.group === laneIDset[g]) {
											belongToLane = true
											g = laneIDset.length
										}
									}
									// console.log(belongToLane)
									let currentProcess = ''
									for (let p = 0; p < processAndLane.length; p++) {
										if (node.group === processAndLane[p].toString().split(' ')[0]) {
											currentProcess = processAndLane[p].toString().split(' ')[1]
										}
									}
									if (belongToLane === true) {
										let flowNodeRef = xmlDoc.createElement('bpmn:flowNodeRef')
										flowNodeRef.append(node.key)
										xmlDoc.getElementById(node.group).appendChild(flowNodeRef)
										xmlDoc.getElementById(currentProcess).insertBefore(event, xmlDoc.getElementById(currentProcess).getElementsByTagName(
											'bpmn:sequenceFlow')[0])
									} else {
										if (node.group !== undefined) {
											// console.log(node.group)
											xmlDoc.getElementById(node.group).appendChild(event)
										} else {
											definitions.insertBefore(event, definitions.getElementsByTagName('bpmndi:BPMNDiagram')[0])
											// process.appendChild(event)
										}
									}

									// process.insertBefore(event,process.getElementsByTagName("bpmn:sequenceFlow")[0])
									// process.appendChild(event)

									let BPMNShape = xmlDoc.createElement('bpmndi:BPMNShape')
									BPMNShape.setAttribute('id', node.key + '_di')
									BPMNShape.setAttribute('bpmnElement', node.key)
									let bounds = xmlDoc.createElement('dc:Bounds')
									let location = node.loc.toString().split(' ')
									bounds.setAttribute('x', location[0])
									bounds.setAttribute('y', location[1])
									BPMNShape.appendChild(bounds)
									BPMNPlane.appendChild(BPMNShape)
									break
								}
							case 'subprocess':
								{
									let subprocess = xmlDoc.createElement('bpmn:subProcess')
									// if (node.isAdHoc == true){
									//   subprocess = xmlDoc.createElement("bpmn:adHocSubProcess")
									// }
									// subprocess.setAttribute("id",node.key)
									// if (node.text != null ){
									//   subprocess.setAttribute("name",node.text)
									// }
									switch (node.item) {
										case 'generic subprocess':
											{
												subprocess.setAttribute('id', node.key)
												if (node.text != null) {
													subprocess.setAttribute('name', node.text)
												}
												break
											}
										case 'adhc subprocess':
											{
												subprocess = xmlDoc.createElement('bpmn:adHocSubProcess')
												subprocess.setAttribute('id', node.key)
												if (node.text != null) {
													subprocess.setAttribute('name', node.text)
												}
												break
											}
										case 'transactional subprocess':
											{
												subprocess = xmlDoc.createElement('bpmn:transaction')
												subprocess.setAttribute('id', node.key)
												if (node.text != null) {
													subprocess.setAttribute('name', node.text)
												}
												break
											}
										case 'looping activity':
											{
												subprocess.setAttribute('id', node.key)
												if (node.text != null) {
													subprocess.setAttribute('name', node.text)
												}
												let standardLoopCharacteristics = xmlDoc.createElement('bpmn:standardLoopCharacteristics')
												subprocess.appendChild(standardLoopCharacteristics)

												break
											}
										case 'multi-Instance activity':
											{
												subprocess.setAttribute('id', node.key)
												if (node.text != null) {
													subprocess.setAttribute('name', node.text)
												}
												let multiInstanceLoopCharacteristics = xmlDoc.createElement('bpmn:multiInstanceLoopCharacteristics')
												subprocess.appendChild(multiInstanceLoopCharacteristics)

												break
											}
										case 'sequential activity':
											{
												subprocess.setAttribute('id', node.key)
												if (node.text != null) {
													subprocess.setAttribute('name', node.text)
												}
												let multiInstanceLoopCharacteristics = xmlDoc.createElement('bpmn:multiInstanceLoopCharacteristics')
												multiInstanceLoopCharacteristics.setAttribute('isSequential', 'true')
												subprocess.appendChild(multiInstanceLoopCharacteristics)
												break
											}
									}
									if (isIncludedOtherInfo === 1) {
										subprocess.setAttribute('category', node.category)
										subprocess.setAttribute('taskType', node.taskType)
										if (node.item !== undefined) {
											subprocess.setAttribute('item', node.item)
										}
										if (node.isGroup === 'true') {
											subprocess.setAttribute('isGroup', 'true')
										}
										if (node.isAdHoc === 'true') {
											subprocess.setAttribute('isAdHoc', 'true')
										}
										if (node.group === undefined) {} else {
											subprocess.setAttribute('group', node.group.toString())
										}
										if (node.Name !== undefined) {
											subprocess.setAttribute('alias', node.Name)
										}
										if (node.Annotation !== undefined) {
											subprocess.setAttribute('annotation', node.Annotation)
										}
										if (node.achievedGoal !== undefined) {
											subprocess.setAttribute('achievedGoal', node.achievedGoal)
										}
									}
									if (node.isSequential === true) {
										let multiInstanceLoopCharacteristics = xmlDoc.createElement('bpmn:multiInstanceLoopCharacteristics')
										multiInstanceLoopCharacteristics.setAttribute('isSequential', 'true')
										subprocess.appendChild(multiInstanceLoopCharacteristics)
									}
									if (node.isParallel === true) {
										let multiInstanceLoopCharacteristics = xmlDoc.createElement('bpmn:multiInstanceLoopCharacteristics')
										subprocess.appendChild(multiInstanceLoopCharacteristics)
									}
									if (node.isLoop === true) {
										let standardLoopCharacteristics = xmlDoc.createElement('bpmn:standardLoopCharacteristics')
										subprocess.appendChild(standardLoopCharacteristics)
									}
									let datastoreIn = [] // 记录link中为dataInputAssociation
									let datastoreOut = [] // 记录link中dataOutputAssociation
									for (let j = 0; j < linkArray.length; j++) {
										if (!sequenceFlowIdMapping[j].toString().startsWith('Sequence')) {
											if (sequenceFlowIdMapping[j].toString().startsWith('data')) {
												if (linkArray[j].from.toString() === node.key) {
													datastoreOut.push(j)
												}
												if (linkArray[j].to.toString() === node.key) {
													datastoreIn.push(j)
												}
											}
											continue
										}
										let identFrom = 0
										let identTo = 0
										if (linkArray[j].from.toString() === node.key) {
											identFrom = 1
										}
										if (linkArray[j].to.toString() === node.key) {
											identTo = 1
										}
										if (identFrom === 0 && identTo === 0) {
											continue
										} else {
											if (identFrom === 1) {
												let outgoing = xmlDoc.createElement('bpmn:outgoing')
												outgoing.append(sequenceFlowIdMapping[j].toString())
												subprocess.appendChild(outgoing)
												if (linkArray[j].isDefault === true) {
													subprocess.setAttribute('default', sequenceFlowIdMapping[j].toString())
												}
											}
											if (identTo === 1) {
												let incoming = xmlDoc.createElement('bpmn:incoming')
												incoming.append(sequenceFlowIdMapping[j].toString())
												// task.appendChild(incoming)
												subprocess.insertBefore(incoming, subprocess.firstElementChild)
											}
										}
									}
									if (datastoreIn.length > 0) {
										// console.log(datastoreIn)
										// let index = parseInt(datastoreIn[0])
										// console.log(link[index].from.toString())
										let property = xmlDoc.createElement('bpmn:property')
										let newid = this.randomName('Property')
										property.setAttribute('id', newid)
										subprocess.appendChild(property)
										for (let inp = 0; inp < datastoreIn.length; inp++) {
											let dataInputAssociation = xmlDoc.createElement('bpmn:dataInputAssociation')
											let msgName = this.randomName('DataInputAssociation')
											dataInputAssociation.setAttribute('id', msgName)
											let sourceRef = xmlDoc.createElement('bpmn:sourceRef')
											sourceRef.append(linkArray[datastoreIn[inp]].from.toString())
											let targetRef = xmlDoc.createElement('bpmn:targetRef')
											targetRef.append(newid)
											dataInputAssociation.appendChild(sourceRef)
											dataInputAssociation.appendChild(targetRef)
											subprocess.appendChild(dataInputAssociation)
											// 保存位置信息
											let edge = xmlDoc.createElement('bpmndi:BPMNEdge')
											edge.setAttribute('id', msgName + '_di')
											edge.setAttribute('bpmnElement', msgName)
											let pointSet = linkArray[datastoreIn[inp]].points
											for (let p = 0; p < pointSet.length; p++) {
												let loc = xmlDoc.createElement('di:waypoint')
												loc.setAttribute('x', pointSet[p])
												p++
												loc.setAttribute('y', pointSet[p])
												edge.appendChild(loc)
											}
											BPMNPlane.appendChild(edge)
										}
									}

									for (let outp = 0; outp < datastoreOut.length; outp++) {
										let dataOutputAssociation = xmlDoc.createElement('bpmn:dataOutputAssociation')
										let newidOut = this.randomName('DataOutputAssociation')
										dataOutputAssociation.setAttribute('id', newidOut)
										let targetRef = xmlDoc.createElement('bpmn:targetRef')
										targetRef.append(linkArray[datastoreOut[outp]].to.toString())
										dataOutputAssociation.appendChild(targetRef)
										subprocess.appendChild(dataOutputAssociation)
										// 保存位置信息
										let edge = xmlDoc.createElement('bpmndi:BPMNEdge')
										edge.setAttribute('id', newidOut + '_di')
										edge.setAttribute('bpmnElement', newidOut)
										let pointSet = linkArray[datastoreOut[outp]].points
										for (let p = 0; p < pointSet.length; p++) {
											let loc = xmlDoc.createElement('di:waypoint')
											loc.setAttribute('x', pointSet[p])
											p++
											loc.setAttribute('y', pointSet[p])
											edge.appendChild(loc)
										}
										BPMNPlane.appendChild(edge)
									}
									// process.appendChild(subprocess)
									let belongToLane = false
									for (let g = 0; g < laneIDset.length; g++) {
										if (node.group === laneIDset[g]) {
											belongToLane = true
											g = laneIDset.length
										}
									}
									let currentProcess = ''
									for (let p = 0; p < processAndLane.length; p++) {
										if (node.group === processAndLane[p].toString().split(' ')[0]) {
											currentProcess = processAndLane[p].toString().split(' ')[1]
										}
									}
									if (node.boundaryEventArray === undefined) {

									} else {
										let boundaryArray = node.boundaryEventArray
										for (let b = 0; b < boundaryArray.length; b++) {
											let boundary = xmlDoc.createElement('bpmn:boundaryEvent')
											boundary.setAttribute('id', this.randomName('IntermediateThrowEvent'))
											boundary.setAttribute('attachedToRef', node.key)
											if (isIncludedOtherInfo === 1) {
												boundary.setAttribute('eventType', boundaryArray[b].eventType)
												boundary.setAttribute('eventDimension', boundaryArray[b].eventDimension)
												boundary.setAttribute('portId', boundaryArray[b].portId)
												boundary.setAttribute('alignmentIndex', boundaryArray[b].alignmentIndex)
											}
											switch (boundaryArray[b].eventType) {
												case 2:
													{
														let messageEventDefinition = xmlDoc.createElement('bpmn:messageEventDefinition')
														boundary.appendChild(messageEventDefinition)
														break
													}
												case 3:
													{
														let timerEventDefinition = xmlDoc.createElement('bpmn:timerEventDefinition')
														boundary.appendChild(timerEventDefinition)
														break
													}
												case 4:
													{
														let escalationEventDefinition = xmlDoc.createElement('bpmn:escalationEventDefinition')
														boundary.appendChild(escalationEventDefinition)
														if (boundaryArray[b].eventDimension === 6) {
															boundary.setAttribute('cancelActivity', 'false')
														}
														break
													}
												case 7:
													{
														let errorEventDefinition = xmlDoc.createElement('bpmn:errorEventDefinition')
														boundary.appendChild(errorEventDefinition)
														break
													}
												case 10:
													{
														let signalEventDefinition = xmlDoc.createElement('bpmn:signalEventDefinition')
														boundary.appendChild(signalEventDefinition)
														break
													}
											}
											if (belongToLane === true) {
												let flowNodeRef = xmlDoc.createElement('bpmn:flowNodeRef')
												flowNodeRef.append(node.key)
												xmlDoc.getElementById(node.group).appendChild(flowNodeRef)
												xmlDoc.getElementById(currentProcess).insertBefore(boundary, xmlDoc.getElementById(currentProcess).getElementsByTagName(
													'bpmn:sequenceFlow')[0])
											} else {
												if (node.group !== undefined) {
													xmlDoc.getElementById(node.group).appendChild(boundary)
												}
												/* else {
												                     process.appendChild(boundary)
												                   } */
											}
										}
									}
									if (belongToLane === true) {
										let flowNodeRef = xmlDoc.createElement('bpmn:flowNodeRef')
										flowNodeRef.append(node.key)
										xmlDoc.getElementById(node.group).appendChild(flowNodeRef)
										xmlDoc.getElementById(currentProcess).insertBefore(subprocess, xmlDoc.getElementById(currentProcess).getElementsByTagName(
											'bpmn:sequenceFlow')[0])
									} else {
										if (node.group !== undefined) {
											xmlDoc.getElementById(node.group).appendChild(subprocess)
										} else {
											definitions.insertBefore(subprocess, definitions.getElementsByTagName('bpmndi:BPMNDiagram')[0])
											// process.appendChild(subprocess)
										}
									}

									// 保存位置属性
									let BPMNShape = xmlDoc.createElement('bpmndi:BPMNShape')
									BPMNShape.setAttribute('id', node.key + '_di')
									BPMNShape.setAttribute('id', node.key + '_di')
									// BPMNPlane.setAttribute("bpmnElement",node.key)
									let bounds = xmlDoc.createElement('dc:Bounds')
									let location = node.loc.toString().split(' ')
									bounds.setAttribute('x', location[0])
									bounds.setAttribute('y', location[1])
									BPMNShape.appendChild(bounds)
									BPMNPlane.appendChild(BPMNShape)
									break
								}
							case 'gateway':
								{
									let gateway = xmlDoc.createElement('bpmn:parallelGateway')
									switch (node.gatewayType) {
										case 1:
											{
												gateway = xmlDoc.createElement('bpmn:parallelGateway')
												gateway.setAttribute('id', node.key)
												if (node.text != null) {
													gateway.setAttribute('name', node.text)
												}
												// process.appendChild(gateway)
												break
											}
										case 4:
											{
												gateway = xmlDoc.createElement('bpmn:exclusiveGateway')
												gateway.setAttribute('id', node.key)
												if (node.text != null) {
													gateway.setAttribute('name', node.text)
												}
												// process.appendChild(gateway)
												break
											}
										case 2:
											{
												gateway = xmlDoc.createElement('bpmn:inclusiveGateway')
												gateway.setAttribute('id', node.key)
												if (node.text != null) {
													gateway.setAttribute('name', node.text)
												}
												// process.appendChild(gateway)
												break
											}
										case 5:
											{
												gateway = xmlDoc.createElement('bpmn:eventBasedGateway')
												gateway.setAttribute('id', node.key)
												if (node.text != null) {
													gateway.setAttribute('name', node.text)
												}
												// process.appendChild(gateway)
												break
											}
										case 3:
											{
												gateway = xmlDoc.createElement('bpmn:complexGateway')
												gateway.setAttribute('id', node.key)
												if (node.text != null) {
													gateway.setAttribute('name', node.text)
												}
												// process.appendChild(gateway)
												break
											}
										case 6:
											{
												gateway = xmlDoc.createElement('bpmn:eventBasedGateway')
												gateway.setAttribute('id', node.key)
												gateway.setAttribute('eventGatewayType', 'Exclusive')
												if (node.text != null) {
													gateway.setAttribute('name', node.text)
												}
												// process.appendChild(gateway)
												break
											}
										case 7:
											{
												gateway = xmlDoc.createElement('bpmn:eventBasedGateway')
												gateway.setAttribute('id', node.key)
												gateway.setAttribute('eventGatewayType', 'Parallel')
												if (node.text != null) {
													gateway.setAttribute('name', node.text)
												}
												// process.appendChild(gateway)
												break
											}
									}
									if (isIncludedOtherInfo === 1) {
										gateway.setAttribute('category', node.category)
										gateway.setAttribute('gatewayType', node.gatewayType)
										if (node.item !== undefined) {
											gateway.setAttribute('item', node.item)
										}
										if (node.group === undefined) {} else {
											gateway.setAttribute('group', node.group.toString())
										}
										if (node.Name !== undefined) {
											gateway.setAttribute('alias', node.Name)
										}
										if (node.Annotation !== undefined) {
											gateway.setAttribute('annotation', node.Annotation)
										}
										if (node.achievedGoal !== undefined) {
											gateway.setAttribute('achievedGoal', node.achievedGoal)
										}
									}

									for (let j = 0; j < linkArray.length; j++) {
										if (!sequenceFlowIdMapping[j].toString().startsWith('Sequence')) {
											continue
										}
										let identFrom = 0
										let identTo = 0
										if (linkArray[j].from.toString() === node.key) {
											identFrom = 1
										}
										if (linkArray[j].to.toString() === node.key) {
											identTo = 1
										}
										if (identFrom === 0 & identTo === 0) {
											continue
										} else {
											if (identFrom === 1) {
												let outgoing = xmlDoc.createElement('bpmn:outgoing')
												outgoing.append(sequenceFlowIdMapping[j].toString())
												gateway.appendChild(outgoing)
												if (linkArray[j].isDefault === true) {
													gateway.setAttribute('default', sequenceFlowIdMapping[j].toString())
												}
											}
											if (identTo === 1) {
												let incoming = xmlDoc.createElement('bpmn:incoming')
												incoming.append(sequenceFlowIdMapping[j].toString())
												gateway.appendChild(incoming)
											}
										}
									}
									let belongToLane = false
									for (let g = 0; g < laneIDset.length; g++) {
										if (node.group === laneIDset[g]) {
											belongToLane = true
											g = laneIDset.length
										}
									}
									let currentProcess = ''
									for (let p = 0; p < processAndLane.length; p++) {
										if (node.group === processAndLane[p].toString().split(' ')[0]) {
											currentProcess = processAndLane[p].toString().split(' ')[1]
										}
									}
									if (belongToLane === true) {
										let flowNodeRef = xmlDoc.createElement('bpmn:flowNodeRef')
										flowNodeRef.append(node.key)
										xmlDoc.getElementById(node.group).appendChild(flowNodeRef)
										xmlDoc.getElementById(currentProcess).insertBefore(gateway, xmlDoc.getElementById(currentProcess).getElementsByTagName(
											'bpmn:sequenceFlow')[0])
									} else {
										if (node.group !== undefined) {
											xmlDoc.getElementById(node.group).appendChild(gateway)
										} else {
											definitions.insertBefore(gateway, definitions.getElementsByTagName('bpmndi:BPMNDiagram')[0])
										}
										// process.appendChild(gateway)
									}
									// process.insertBefore(gateway,process.getElementsByTagName("bpmn:sequenceFlow")[0])
									// 保存位置属性
									let BPMNShape = xmlDoc.createElement('bpmndi:BPMNShape')
									BPMNShape.setAttribute('id', node.key + '_di')
									BPMNShape.setAttribute('bpmnElement', node.key)
									if (node.gatewayType === 4) {
										BPMNShape.setAttribute('isMarkerVisible', 'true')
									}
									let bounds = xmlDoc.createElement('dc:Bounds')
									let location = node.loc.toString().split(' ')
									bounds.setAttribute('x', location[0])
									bounds.setAttribute('y', location[1])
									BPMNShape.appendChild(bounds)
									BPMNPlane.appendChild(BPMNShape)
									break
								}
							case 'dataobject':
								{
									let dataobject = xmlDoc.createElement('bpmn:dataObject')
									let dataobjName = this.randomName('DataObject')
									dataobject.setAttribute('id', dataobjName)
									// process.appendChild(dataobject)

									let dataObjectReference = xmlDoc.createElement('bpmn:dataObjectReference')
									dataObjectReference.setAttribute('id', node.key)
									if (node.text != null) {
										dataObjectReference.setAttribute('name', node.text)
									}
									dataObjectReference.setAttribute('dataObjectRef', dataobjName)
									if (isIncludedOtherInfo === 1) {
										dataObjectReference.setAttribute('category', node.category)
										if (node.item !== undefined) {
											dataObjectReference.setAttribute('item', node.item)
										}
										if (node.group === undefined) {} else {
											dataObjectReference.setAttribute('group', node.group.toString())
										}
										if (node.Name !== undefined) {
											dataObjectReference.setAttribute('alias', node.Name)
										}
										if (node.Annotation !== undefined) {
											dataObjectReference.setAttribute('annotation', node.Annotation)
										}
										if (node.achievedGoal !== undefined) {
											dataObjectReference.setAttribute('achievedGoal', node.achievedGoal)
										}
									}
									// 保存位置属性
									let BPMNShape = xmlDoc.createElement('bpmndi:BPMNShape')
									BPMNShape.setAttribute('id', node.key + '_di')
									BPMNShape.setAttribute('bpmnElement', node.key)
									let bounds = xmlDoc.createElement('dc:Bounds')
									let location = node.loc.toString().split(' ')
									bounds.setAttribute('x', location[0])
									bounds.setAttribute('y', location[1])
									BPMNShape.appendChild(bounds)
									BPMNPlane.appendChild(BPMNShape)
									let belongToLane = false
									for (let g = 0; g < laneIDset.length; g++) {
										if (node.group === laneIDset[g]) {
											belongToLane = true
											g = laneIDset.length
										}
									}
									let currentProcess = ''
									for (let p = 0; p < processAndLane.length; p++) {
										if (node.group === processAndLane[p].toString().split(' ')[0]) {
											currentProcess = processAndLane[p].toString().split(' ')[1]
										}
									}
									if (belongToLane === true) {
										xmlDoc.getElementById(currentProcess).insertBefore(dataobject, xmlDoc.getElementById(currentProcess).getElementsByTagName(
											'bpmn:sequenceFlow')[0])
										xmlDoc.getElementById(currentProcess).insertBefore(dataObjectReference, xmlDoc.getElementById(currentProcess)
											.getElementsByTagName('bpmn:sequenceFlow')[0])
									} else {
										if (node.group !== undefined) {
											xmlDoc.getElementById(node.group).appendChild(dataobject)
											xmlDoc.getElementById(node.group).appendChild(dataObjectReference)
										} else {
											definitions.insertBefore(dataobject, definitions.getElementsByTagName('bpmndi:BPMNDiagram')[0])
											definitions.insertBefore(dataObjectReference, definitions.getElementsByTagName('bpmndi:BPMNDiagram')[0])
											// process.appendChild(dataobject)
											// process.appendChild(dataObjectReference)
										}
									}
									// process.appendChild(dataObjectReference)
									break
								}
							case 'datastore':
								{
									let datastore = xmlDoc.createElement('bpmn:dataStoreReference')
									datastore.setAttribute('id', node.key)
									if (node.text != null) {
										datastore.setAttribute('name', node.text)
									}
									if (isIncludedOtherInfo === 1) {
										datastore.setAttribute('category', node.category)
										if (node.item !== undefined) {
											datastore.setAttribute('item', node.item)
										}
										if (node.group === undefined) {} else {
											datastore.setAttribute('group', node.group.toString())
										}
										if (node.Name !== undefined) {
											datastore.setAttribute('alias', node.Name)
										}
										if (node.Annotation !== undefined) {
											datastore.setAttribute('annotation', node.Annotation)
										}
										if (node.achievedGoal !== undefined) {
											datastore.setAttribute('achievedGoal', node.achievedGoal)
										}
									}

									let belongToLane = false
									for (let g = 0; g < laneIDset.length; g++) {
										if (node.group === laneIDset[g]) {
											belongToLane = true
											g = laneIDset.length
										}
									}
									let currentProcess = ''
									for (let p = 0; p < processAndLane.length; p++) {
										if (node.group === processAndLane[p].toString().split(' ')[0]) {
											currentProcess = processAndLane[p].toString().split(' ')[1]
										}
									}
									if (belongToLane === true) {
										xmlDoc.getElementById(currentProcess).insertBefore(datastore, xmlDoc.getElementById(currentProcess).getElementsByTagName(
											'bpmn:sequenceFlow')[0])
									} else {
										if (node.group !== undefined) {
											xmlDoc.getElementById(node.group).appendChild(datastore)
										} else {
											definitions.insertBefore(datastore, definitions.getElementsByTagName('bpmndi:BPMNDiagram')[0])
											// definitions.appendChild(datastore)
										}
									}
									// process.appendChild(datastore)
									// 保存位置属性
									let BPMNShape = xmlDoc.createElement('bpmndi:BPMNShape')
									BPMNShape.setAttribute('id', node.key + '_di')
									BPMNShape.setAttribute('bpmnElement', node.key)
									let bounds = xmlDoc.createElement('dc:Bounds')
									let location = node.loc.toString().split(' ')
									bounds.setAttribute('x', location[0])
									bounds.setAttribute('y', location[1])
									BPMNShape.appendChild(bounds)
									BPMNPlane.appendChild(BPMNShape)
									break
								}

							case 'annotation':
								{
									let annotation = xmlDoc.createElement('bpmn:textAnnotation')
									annotation.setAttribute('id', node.key)
									let text = xmlDoc.createElement('bpmn:text')
									text.append(node.text)
									annotation.appendChild(text)
									if (isIncludedOtherInfo === 1) {
										annotation.setAttribute('category', node.category)
										if (node.item !== undefined) {
											annotation.setAttribute('item', node.item)
										}
										if (node.group === undefined) {} else {
											annotation.setAttribute('group', node.group.toString())
										}
										if (node.Name !== undefined) {
											annotation.setAttribute('alias', node.Name)
										}
										if (node.Annotation !== undefined) {
											annotation.setAttribute('annotation', node.Annotation)
										}
										if (node.achievedGoal !== undefined) {
											annotation.setAttribute('achievedGoal', node.achievedGoal)
										}
									}
									// 保存位置属性
									let BPMNShape = xmlDoc.createElement('bpmndi:BPMNShape')
									BPMNShape.setAttribute('id', node.key + '_di')
									BPMNShape.setAttribute('bpmnElement', node.key)
									let bounds = xmlDoc.createElement('dc:Bounds')
									let location = node.loc.toString().split(' ')
									bounds.setAttribute('x', location[0])
									bounds.setAttribute('y', location[1])
									BPMNShape.appendChild(bounds)
									BPMNPlane.appendChild(BPMNShape)
									let belongToLane = false
									for (let g = 0; g < laneIDset.length; g++) {
										if (node.group === laneIDset[g]) {
											belongToLane = true
											g = laneIDset.length
										}
									}
									let currentProcess = ''
									for (let p = 0; p < processAndLane.length; p++) {
										if (node.group === processAndLane[p].toString().split(' ')[0]) {
											currentProcess = processAndLane[p].toString().split(' ')[1]
										}
									}
									if (belongToLane === true) {
										xmlDoc.getElementById(currentProcess).insertBefore(annotation, xmlDoc.getElementById(currentProcess).getElementsByTagName(
											'bpmn:sequenceFlow')[0])
									} else {
										if (node.group !== undefined) {
											xmlDoc.getElementById(node.group).appendChild(annotation)
										} else {
											// definitions.appendChild(annotation)
											definitions.insertBefore(annotation, definitions.getElementsByTagName('bpmndi:BPMNDiagram')[0])
										}
									}
									// process.appendChild(annotation)
									for (let i = 0; i < sequenceFlowIdMapping.length; i++) {
										if (sequenceFlowIdMapping[i].toString().startsWith('annotation') && (linkArray[i].to.toString() === node.key ||
												linkArray[i].from.toString() === node.key)) {
											// console.log('annotation')
											let association = xmlDoc.createElement('bpmn:association')
											let msgName = this.randomName('Association')
											association.setAttribute('id', msgName)
											association.setAttribute('sourceRef', linkArray[i].to)
											association.setAttribute('targetRef', linkArray[i].from)
											// 保存位置信息
											let edge = xmlDoc.createElement('bpmndi:BPMNEdge')
											edge.setAttribute('id', msgName + '_di')
											edge.setAttribute('bpmnElement', msgName)
											let pointSet = linkArray[i].points
											for (let p = 0; p < pointSet.length; p++) {
												let loc = xmlDoc.createElement('di:waypoint')
												loc.setAttribute('x', pointSet[p])
												p++
												loc.setAttribute('y', pointSet[p])
												edge.appendChild(loc)
											}
											BPMNPlane.appendChild(edge)

											if (belongToLane === true) {
												xmlDoc.getElementById(currentProcess).insertBefore(association, xmlDoc.getElementById(currentProcess).getElementsByTagName(
													'bpmn:sequenceFlow')[0])
											} else {
												if (node.group !== undefined) {
													xmlDoc.getElementById(node.group).appendChild(association)
												} else {
													// definitions.appendChild(association)
													definitions.insertBefore(association, definitions.getElementsByTagName('bpmndi:BPMNDiagram')[0])
												}
											}
											// process.appendChild(association)
										}
									}

									break
								}
						}
					}
				}
				// 创建边
				for (let i = 0; i < linkNum; i++) {
					let link = linkArray[i]
					if (link.category === undefined) {
						let sequenceFlow = xmlDoc.createElement('bpmn:sequenceFlow')
						let name = sequenceFlowIdMapping[i]
						sequenceFlow.setAttribute('id', name)
						if (link.visible === true) {
							if (link.text !== undefined) {
								sequenceFlow.setAttribute('name', link.text)
							} else {
								sequenceFlow.setAttribute('name', 'label')
							}
						}
						sequenceFlow.setAttribute('sourceRef', link.from)
						sequenceFlow.setAttribute('targetRef', link.to)
						if (link.isDefault === false) {
							let conditionExpression = xmlDoc.createElement('bpmn:conditionExpression')
							conditionExpression.setAttribute('xsi:type', 'bpmn:tFormalExpression')
							sequenceFlow.appendChild(conditionExpression)
						}
						if (isIncludedOtherInfo === 1) {
							if (link.isDefault === undefined) {} else {
								sequenceFlow.setAttribute('isDefault', link.isDefault.toString())
							}
							if (link.visible === undefined) {} else {
								sequenceFlow.setAttribute('visible', link.visible.toString())
							}
						}

						for (let n = 0; n < nodeArray.length; n++) {
							let fromNode = nodeArray[n]
							if (fromNode.key === link.from.toString() || fromNode.key === link.from) {
								// console.log(n)
								// seqin = seqin + 1
								let belongToLane = false
								for (let g = 0; g < laneIDset.length; g++) {
									if (fromNode.group === laneIDset[g]) {
										belongToLane = true
										g = laneIDset.length
									}
								}
								let curProcess = ''
								for (let p = 0; p < processAndLane.length; p++) {
									if (fromNode.group === processAndLane[p].toString().split(' ')[0]) {
										curProcess = processAndLane[p].toString().split(' ')[1]
									}
								}
								if (belongToLane === true) {
									xmlDoc.getElementById(curProcess).appendChild(sequenceFlow)
									break
								} else {
									if (fromNode.group !== undefined) {
										// console.log('get seq')
										xmlDoc.getElementById(fromNode.group.toString()).appendChild(sequenceFlow)
									} else {
										definitions.insertBefore(sequenceFlow, definitions.getElementsByTagName('bpmndi:BPMNDiagram')[0])
									}
									break
								}
								// process.appendChild(sequenceFlow)
							}
						}

						// 保存位置信息
						let edge = xmlDoc.createElement('bpmndi:BPMNEdge')
						edge.setAttribute('id', name + '_di')
						edge.setAttribute('bpmnElement', name)
						let pointSet = link.points
						for (let p = 0; p < pointSet.length; p++) {
							let loc = xmlDoc.createElement('di:waypoint')
							loc.setAttribute('x', pointSet[p])
							p++
							loc.setAttribute('y', pointSet[p])
							edge.appendChild(loc)
						}
						BPMNPlane.appendChild(edge)
					}
					/* else {
					          sequenceFlowIdMapping.push(link.category + '_' + link.from)
					        } */
				}
				for (let m = 0; m < sequenceFlowIdMapping.length; m++) {
					if (sequenceFlowIdMapping[m].toString().startsWith('msg')) {
						let messageFlow = xmlDoc.createElement('bpmn:messageFlow')
						let msgName = this.randomName('MessageFlow')
						messageFlow.setAttribute('id', msgName)
						messageFlow.setAttribute('sourceRef', linkArray[m].from)
						messageFlow.setAttribute('targetRef', linkArray[m].to)
						xmlDoc.getElementsByTagName('bpmn:collaboration').item(0).appendChild(messageFlow)
						// collaboration.appendChild(messageFlow)
						// 保存位置信息
						let edge = xmlDoc.createElement('bpmndi:BPMNEdge')
						edge.setAttribute('id', msgName + '_di')
						edge.setAttribute('bpmnElement', msgName)
						let pointSet = linkArray[m].points
						for (let p = 0; p < pointSet.length; p++) {
							let loc = xmlDoc.createElement('di:waypoint')
							loc.setAttribute('x', pointSet[p])
							p++
							loc.setAttribute('y', pointSet[p])
							edge.appendChild(loc)
						}
						BPMNPlane.appendChild(edge)
					}
				}
				return '<?xml version="1.0" encoding="utf-8"?>\n\n' + new XMLSerializer().serializeToString(xmlDoc)
			},

			randomName(pre) {
				let str1 = 'abcdefghijklmnopqrstuvwxyz'
				let array = str1.split('')

				let number = pre + '_'
				for (let i = 0; i < 2; i++) {
					number += Math.floor(Math.random() * 10)
				}
				for (let j = 0; j < 3; j++) {
					let n = Math.round(Math.random() * (array.length - 1))
					number += array[n]
				}

				return number
			},
			Json2Rdf() {
				let jsonObj = JSON.parse(this.myDiagram.model.toJson())
				let modelName = jsonObj.class
				let xmlDoc = document.implementation.createDocument(null, null)
				let root = xmlDoc.createElement('rdf:RDF')
				root.setAttribute('xmlns:rdf', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#')
				root.setAttribute('xmlns:si', 'http://www.runoob.com/rdf/')
				xmlDoc.appendChild(root)
				let linkArray = jsonObj.linkDataArray
				let nodeArray = jsonObj.nodeDataArray
				let mapping = []
				for (let i = 0; i < nodeArray.length; i++) {
					mapping.push(nodeArray[i].key)
					let node = xmlDoc.createElement('rdf:Description')
					node.setAttribute('rdf:about', modelName + '/' + nodeArray[i].Name)
					node.setAttribute('Type', nodeArray[i].Type.substring(2, nodeArray[i].Type.length - 2))
					node.setAttribute('NodeType', nodeArray[i].nodeType)
					root.appendChild(node)
				}
				// console.log(linkArray.length)
				for (let j = 0; j < linkArray.length; j++) {
					let linkType = linkArray[j].Linktype
					// console.log(linkType)
					linkType = linkType === undefined ? '普通连接' : linkType
					let node = xmlDoc.createElement('si' + linkType)
					let text = root.children[mapping.indexOf(linkArray[j].to)].getAttribute('rdf:about')
					let textNode = xmlDoc.createTextNode(text)
					node.appendChild(textNode)
					root.children[mapping.indexOf(linkArray[j].from)].appendChild(node)
				}
				return '<?xml version="1.0" encoding="utf-8"?>\n\n' + new XMLSerializer().serializeToString(xmlDoc)
			},
			undo() {
				this.myDiagram.commandHandler.undo()
			},
			redo() {
				this.myDiagram.commandHandler.redo()
			},
			cutSelection() {
				this.myDiagram.commandHandler.cutSelection()
			},
			saveDiagram(exit = false) {
				this.save()
				this.$ajax.put('api/diagram', {
						'diagramName': this.$refs.projectName.innerHTML,
						'jsonContent': JSON.stringify(JSON.parse(this.myDiagram.model.toJson())),
						'imageContent': this.imageData,
						'diagramId': this.diagram.diagramId
					})
					.then((response) => {
						console.log(response)
						const code = response.data.code
						if (code === 1) {
							alert('保存成功')
							if (exit === true) {
								this.$router.back(-1)
							}
						}
					})
					.catch((error) => {
						alert('保存失败，请重试')
						console.log(error)
					})
			},
			copySelection() {
				this.myDiagram.commandHandler.copySelection()
			},
			add1() {
				console.log("1")
				// this.myDiagram.model.addNodeData({key: 'Lane5',
				// 		text: '泳道 1',
				// 		isGroup: 'true',
				// 		group: '501',
				// 		color: 'lightyellow',
				// 		category: 'Lane'} )
				
				this.myDiagram.model.addNodeData({key: 401,
						category: 'privateProcess',
						text: '池'} )
				//var node = clickCreatingTool.archetypeNodeData("new");
				//node.location = node.location.copy().snapToGridPoint(e.diagram.grid.gridOrigin, e.diagram.grid.gridCellSize);
				console.log("2")
				this.$options.methods.saveDiagram();
				console.log("3")
				const id = this.$route.query.id
				this.curDiagramType = this.$route.query.diagramType
				
				this.$ajax.get('api/diagram', {
				  params: {
				    'diagramId': id
				  }})
				  .then((response) => {
				    console.log("created:",response)
				    const code = response.data.code
				    if (code === 1) {
						
				     this.diagram = response.data.data
				            console.log("this.diagram new2:",this.diagram.jsonContent)
				
				    }
				  })
				  .catch((error) => {
				    console.log(error)
				  })
				mySelf.$ajax.get('api/folder')
					.then((response) => {
						console.log(response)
						const code = response.data.code
						if (code === 1) {
							for (let folder of response.data.data) {
								mySelf.folders.push({
									text: folder.folderName,
									value: folder.folderId
								})
							}
						}
					})
					.catch((error) => {
						console.log(error)
					})
					console.log("4")
				// commandHandler: $(DrawCommandHandler),  // support offset copy-and-paste
				//         "clickCreatingTool.archetypeNodeData": { text: "NEW NODE" },  // create a new node by double-clicking in background
				//         "PartCreated": function(e) {
				//           var node = e.subject;  // the newly inserted Node -- now need to snap its location to the grid
				//           node.location = node.location.copy().snapToGridPoint(e.diagram.grid.gridOrigin, e.diagram.grid.gridCellSize);
				//           setTimeout(function() {  // and have the user start editing its text
				//             e.diagram.commandHandler.editTextBlock();
				//           }, 20);
				//         },
				//         "commandHandler.archetypeGroupData": { isGroup: true, text: "NEW GROUP" },
				//         "SelectionGrouped": function(e) {
				//           var group = e.subject;
				//           setTimeout(function() {  // and have the user start editing its text
				//             e.diagram.commandHandler.editTextBlock();
				//           })
				//         },
			},
			pasteSelection() {
				this.myDiagram.commandHandler.pasteSelection(this.myDiagram.lastInput.documentPoint)
			},
			groupSelection() {
				this.myDiagram.commandHandler.groupSelection()
			},
			ungroupSelection() {
				this.myDiagram.commandHandler.ungroupSelection()
			},
			setDock(num) {
				if (this.shownDock === num) {
					this.shownDock = 0
				} else this.shownDock = num
			},
			
			save() {
				this.saveDiagramProperties() // do this first, before writing to JSON
				this.imageData = this.myDiagram.makeImageData({
					size: new go.Size(318, 178),
					background: '#DAE4EE'
				})
				this.myDiagram.isModified = false
			},

			load(jsonText) {
				this.imageData = this.myDiagram.makeImageData({
					background: '#DAE4EE'
				})
				this.myDiagram.model = go.Model.fromJson(jsonText)
				this.loadDiagramProperties() // do this after the Model.modelData has been brought into memory
				this.myDiagram.model.undoManager.isEnabled = true
			},

			saveDiagramProperties() {
				this.myDiagram.model.modelData.position = go.Point.stringify(this.myDiagram.position)
			},
			loadDiagramProperties(e) {
				// set Diagram.initialPosition, not Diagram.position, to handle initialization side-effects
				let pos = this.myDiagram.model.modelData.position
				if (pos) this.myDiagram.initialPosition = go.Point.parse(pos)
			},

			loadXML(xmlFile) {
				var xmlDoc = null
				var agent = navigator.userAgent.toLowerCase()
				// 支持IE浏览器
				if (agent.indexOf('msie') > 0) {
					alert('22')
					var xmlDomVersions = ['MSXML.2.DOMDocument.6.0', 'MSXML.2.DOMDocument.3.0', 'Microsoft.XMLDOM']
					for (var i = 0; i < xmlDomVersions.length; i++) {
						try {
							if (window.ActiveXObject) {
								// eslint-disable-next-line
								xmlDoc = new ActiveXObject(xmlDomVersions[i])
								break
							}
						} catch (e) {

						}
					}
				} else if (agent.indexOf('firefox') > 0) { // 支持firefox浏览器
					try {
						xmlDoc = document.implementation.createDocument('', '', null)
					} catch (e) {}
				} else { // 谷歌浏览器
					alert('111111111')
					var oXmlHttp = new XMLHttpRequest()
					oXmlHttp.open('GET', xmlFile, false)
					oXmlHttp.send(null)
					return oXmlHttp.responseXML
				}
				return xmlDoc
			},
			BPMNxml2Json(xmlText) {
				// let xotree = new XML.ObjTree()
				// let jsonObject = xotree.parseXML(xmlText).getElementsByTagName('bpmn:definitions')
				// console.log(jsonObject)
				let domParser = new DOMParser()
				let xmldoc = domParser.parseFromString(xmlText, 'text/xml')
				let root = xmldoc.documentElement
				let diagram = root.getElementsByTagName('bpmndi:BPMNDiagram')[0]

				let json = {}
				json.class = 'GraphLinksModel'
				json.modelData = {
					'position': diagram.getAttribute('modelData').toString()
				}
				let nodeArray = []
				let linkArray = []
				// 获取pool和privateprocess节点
				let participant = root.getElementsByTagName('bpmn:participant')
				for (let i = 0; i < participant.length; i++) {
					let node = {}
					let part = participant[i]
					node.key = part.id
					if (part.getAttribute('name') !== undefined) {
						node.text = part.getAttribute('name').toString()
					}
					if (part.getAttribute('category').toString() === 'Pool') {
						node.isGroup = true
						node.category = 'Pool'
					} else if (part.getAttribute('category').toString() === 'privateProcess') {
						node.category = 'privateProcess'
					}
					let bound = xmldoc.getElementById(part.id + '_di').getElementsByTagName('dc:Bounds')[0]
					let locX = bound.getAttribute('x').toString()
					let locY = bound.getAttribute('y').toString()
					node.loc = locX + ' ' + locY
					if (part.getAttribute('alias') !== null) {
						node.Name = part.getAttribute('alias').toString()
					}
					if (part.getAttribute('annotation') !== null) {
						node.Annotation = part.getAttribute('annotation')
					}
					if (part.getAttribute('achievedGoal') !== null) {
						node.achievedGoal = part.getAttribute('achievedGoal')
					}
					nodeArray.push(node)
				}
				// 获取lane节点
				let laneset = root.getElementsByTagName('bpmn:lane')
				for (let i = 0; i < laneset.length; i++) {
					let lane = laneset[i]
					let node = {}
					// console.log(lane.id)
					node.key = lane.id
					if (lane.getAttribute('name') !== undefined) {
						node.text = lane.getAttribute('name').toString()
					}
					node.isGroup = true
					node.group = lane.getAttribute('group').toString()
					node.color = lane.getAttribute('color').toString()
					node.category = lane.getAttribute('category').toString()

					let bound = xmldoc.getElementById(lane.id + '_di').getElementsByTagName('dc:Bounds')[0]
					let locX = bound.getAttribute('x').toString()
					let locY = bound.getAttribute('y').toString()
					node.loc = locX + ' ' + locY
					let width = bound.getAttribute('width').toString()
					let height = bound.getAttribute('height').toString()
					node.size = width + ' ' + height
					if (lane.getAttribute('alias') !== null) {
						node.Name = lane.getAttribute('alias').toString()
					}
					if (lane.getAttribute('annotation') !== null) {
						node.Annotation = lane.getAttribute('annotation')
					}
					if (lane.getAttribute('achievedGoal') !== null) {
						node.achievedGoal = lane.getAttribute('achievedGoal')
					}
					nodeArray.push(node)
				}
				// 获取activity
				let taskset = []
				taskset.push(root.getElementsByTagName('bpmn:task'))
				taskset.push(root.getElementsByTagName('bpmn:callActivity'))
				taskset.push(root.getElementsByTagName('bpmn:userTask'))
				taskset.push(root.getElementsByTagName('bpmn:serviceTask'))
				taskset.push(root.getElementsByTagName('bpmn:receiveTask'))
				taskset.push(root.getElementsByTagName('bpmn:sendTask'))
				taskset.push(root.getElementsByTagName('bpmn:businessRuleTask'))
				taskset.push(root.getElementsByTagName('bpmn:manualTask'))
				taskset.push(root.getElementsByTagName('bpmn:scriptTask'))
				for (let i = 0; i < taskset.length; i++) {
					let tasks = taskset[i]
					for (let j = 0; j < tasks.length; j++) {
						let task = tasks[j]
						let node = {}
						node.key = task.id
						node.category = 'activity'
						if (task.getAttribute('name') !== undefined) {
							// console.log('name', task)
							node.text = task.getAttribute('name')
						}
						node.item = task.getAttribute('item').toString()
						node.taskType = parseInt(task.getAttribute('taskType'))

						if (task.getAttribute('group') !== null) {
							node.group = task.getAttribute('group').toString()
						}
						let bound = xmldoc.getElementById(task.id + '_di').getElementsByTagName('dc:Bounds')[0]
						let locX = bound.getAttribute('x').toString()
						let locY = bound.getAttribute('y').toString()
						node.loc = locX + ' ' + locY
						// 判断isCall
						if (task.getAttribute('isCall') === 'true') {
							node.isCall = true
						}
						// 判断 isSequential 、 isparallel
						let charactics = task.getElementsByTagName('bpmn:multiInstanceLoopCharacteristics')
						for (let c = 0; c < charactics.length; c++) {
							if (charactics[c].getAttribute('isSequential') === 'true') {
								node.isSequential = true
							} else {
								node.isParallel = true
							}
						}
						// 判断 isloop
						charactics = task.getElementsByTagName('bpmn:standardLoopCharacteristics')
						for (let c = 0; c < charactics.length; c++) {
							node.isLoop = true
						}
						// 判断boundaryevent
						let boundarySet = root.getElementsByTagName('bpmn:boundaryEvent')
						if (boundarySet.length > 0) {
							let boundaryArray = []
							for (let b = 0; b < boundarySet.length; b++) {
								if (boundarySet[b].getAttribute('attachedToRef') === task.id) {
									let boundary = {}
									boundary.portId = boundarySet[b].getAttribute('portId').toString()
									boundary.eventType = parseInt(boundarySet[b].getAttribute('eventType'))
									boundary.eventDimension = parseInt(boundarySet[b].getAttribute('eventDimension'))
									boundary.color = 'white'
									boundary.alignmentIndex = parseInt(boundarySet[b].getAttribute('alignmentIndex'))
									boundaryArray.push(boundary)
									node.boundaryEventArray = boundaryArray
								}
							}
						}
						if (task.getAttribute('alias') !== null) {
							node.Name = task.getAttribute('alias').toString()
						}
						if (task.getAttribute('annotation') !== null) {
							node.Annotation = task.getAttribute('annotation')
						}
						if (task.getAttribute('achievedGoal') !== null) {
							node.achievedGoal = task.getAttribute('achievedGoal')
						}
						nodeArray.push(node)
					}
				}
				// 获取event
				let eventSet = []
				eventSet.push(root.getElementsByTagName('bpmn:startEvent'))
				eventSet.push(root.getElementsByTagName('bpmn:endEvent'))
				eventSet.push(root.getElementsByTagName('bpmn:intermediateCatchEvent'))
				eventSet.push(root.getElementsByTagName('bpmn:intermediateThrowEvent'))
				// console.log(eventSet[0].length, eventSet[1].length, eventSet[2].length, eventSet[3].length)
				for (let i = 0; i < eventSet.length; i++) {
					let eventSame = eventSet[i]
					// console.log(eventSame.length)
					for (let j = 0; j < eventSame.length; j++) {
						let myevent = eventSame[j]
						let node = {}
						node.key = myevent.id
						node.category = 'event'
						if (myevent.getAttribute('name') !== undefined) {
							node.text = myevent.getAttribute('name').toString()
						}
						node.eventType = parseInt(myevent.getAttribute('eventType'))
						node.eventDimension = parseInt(myevent.getAttribute('eventDimension'))
						node.item = myevent.getAttribute('item')
						let bound = xmldoc.getElementById(myevent.id + '_di').getElementsByTagName('dc:Bounds')[0]
						let locX = bound.getAttribute('x').toString()
						let locY = bound.getAttribute('y').toString()
						node.loc = locX + ' ' + locY
						if (myevent.getAttribute('group') !== null) {
							node.group = myevent.getAttribute('group').toString()
						}
						if (myevent.getAttribute('alias') !== null) {
							node.Name = myevent.getAttribute('alias').toString()
						}
						if (myevent.getAttribute('annotation') !== null) {
							node.Annotation = myevent.getAttribute('annotation')
						}
						if (myevent.getAttribute('achievedGoal') !== null) {
							node.achievedGoal = myevent.getAttribute('achievedGoal')
						}
						nodeArray.push(node)
					}
				}
				// 获取subprocess
				let subprocessSet = []
				subprocessSet.push(root.getElementsByTagName('bpmn:subProcess'))
				subprocessSet.push(root.getElementsByTagName('bpmn:adHocSubProcess'))
				subprocessSet.push(root.getElementsByTagName('bpmn:transaction'))
				for (let i = 0; i < subprocessSet.length; i++) {
					let subprocessSame = subprocessSet[i]
					for (let j = 0; j < subprocessSame.length; j++) {
						let subprocess = subprocessSame[j]
						let node = {}
						node.key = parseInt(subprocess.id)
						node.category = 'subprocess'
						let bound = xmldoc.getElementById(subprocess.id + '_di').getElementsByTagName('dc:Bounds')[0]
						let locX = bound.getAttribute('x').toString()
						let locY = bound.getAttribute('y').toString()
						node.loc = locX + ' ' + locY
						if (subprocess.getAttribute('name') !== undefined) {
							node.text = subprocess.getAttribute('name').toString()
						}
						node.isGroup = true
						node.isSubProcess = true
						node.taskType = parseInt(subprocess.getAttribute('taskType').toString())
						node.item = subprocess.getAttribute('item').toString()
						if (subprocess.getAttribute('group') !== null) {
							node.group = subprocess.getAttribute('group').toString()
						}
						// 判断 isSequential 、 isparallel
						let charactics = subprocess.getElementsByTagName('bpmn:multiInstanceLoopCharacteristics')
						for (let c = 0; c < charactics.length; c++) {
							if (charactics[c].getAttribute('isSequential') === 'true') {
								node.isSequential = true
							} else {
								node.isParallel = true
							}
						}
						// 判断 isloop
						charactics = subprocess.getElementsByTagName('bpmn:standardLoopCharacteristics')
						for (let c = 0; c < charactics.length; c++) {
							node.isLoop = true
						}
						if (subprocess.getAttribute('isAdHoc') === 'true') {
							node.isAdHoc = true
						}
						// 判断boundaryevent
						let boundarySet = subprocess.getElementsByTagName('bpmn:boundaryEvent')
						if (boundarySet.length > 0) {
							let boundaryArray = []
							for (let b = 0; b < boundarySet.length; b++) {
								let boundary = {}
								boundary.portId = boundarySet[b].getAttribute('portId').toString()
								boundary.eventType = parseInt(boundarySet[b].getAttribute('eventType'))
								boundary.eventDimension = parseInt(boundarySet[b].getAttribute('eventDimension'))
								boundary.color = 'white'
								boundary.alignmentIndex = parseInt(boundarySet[b].getAttribute('alignmentIndex'))
								boundaryArray.push(boundary)
							}
							node.boundaryEventArray = boundaryArray
						}
						if (subprocess.getAttribute('alias') !== null) {
							node.Name = subprocess.getAttribute('alias').toString()
						}
						if (subprocess.getAttribute('annotation') !== null) {
							node.Annotation = subprocess.getAttribute('annotation')
						}
						if (subprocess.getAttribute('achievedGoal') !== null) {
							node.achievedGoal = subprocess.getAttribute('achievedGoal')
						}
						nodeArray.push(node)
					}
				}
				// 获取gateway
				let gatewaySet = []
				gatewaySet.push(root.getElementsByTagName('bpmn:parallelGateway'))
				gatewaySet.push(root.getElementsByTagName('bpmn:exclusiveGateway'))
				gatewaySet.push(root.getElementsByTagName('bpmn:inclusiveGateway'))
				gatewaySet.push(root.getElementsByTagName('bpmn:eventBasedGateway'))
				gatewaySet.push(root.getElementsByTagName('bpmn:complexGateway'))
				for (let i = 0; i < gatewaySet.length; i++) {
					let gatewaySame = gatewaySet[i]
					for (let j = 0; j < gatewaySame.length; j++) {
						let gateway = gatewaySame[j]
						let node = {}
						node.key = gateway.id
						node.category = 'gateway'
						if (gateway.getAttribute('name') !== undefined) {
							node.text = gateway.getAttribute('name').toString()
						}
						node.gatewayType = parseInt(gateway.getAttribute('gatewayType').toString())
						let bound = xmldoc.getElementById(gateway.id + '_di').getElementsByTagName('dc:Bounds')[0]
						let locX = bound.getAttribute('x').toString()
						let locY = bound.getAttribute('y').toString()
						node.loc = locX + ' ' + locY
						if (gateway.getAttribute('group') !== null) {
							node.group = gateway.getAttribute('group').toString()
						}
						if (gateway.getAttribute('alias') !== null) {
							node.Name = gateway.getAttribute('alias').toString()
						}
						if (gateway.getAttribute('annotation') !== null) {
							node.Annotation = gateway.getAttribute('annotation')
						}
						if (gateway.getAttribute('achievedGoal') !== null) {
							node.achievedGoal = gateway.getAttribute('achievedGoal')
						}
						nodeArray.push(node)
					}
				}
				// 获取dataobject
				let dateobjectSet = root.getElementsByTagName('bpmn:dataObjectReference')
				for (let i = 0; i < dateobjectSet.length; i++) {
					let dataobject = dateobjectSet[i]
					let node = {}
					node.key = dataobject.id
					node.category = 'dataobject'
					if (dataobject.getAttribute('name') !== undefined) {
						node.text = dataobject.getAttribute('name').toString()
					}
					let bound = xmldoc.getElementById(dataobject.id + '_di').getElementsByTagName('dc:Bounds')[0]
					let locX = bound.getAttribute('x').toString()
					let locY = bound.getAttribute('y').toString()
					node.loc = locX + ' ' + locY
					if (dataobject.getAttribute('group') !== null) {
						node.group = dataobject.getAttribute('group').toString()
					}
					if (dataobject.getAttribute('alias') !== null) {
						node.Name = dataobject.getAttribute('alias').toString()
					}
					if (dataobject.getAttribute('annotation') !== null) {
						node.Annotation = dataobject.getAttribute('annotation')
					}
					if (dataobject.getAttribute('achievedGoal') !== null) {
						node.achievedGoal = dataobject.getAttribute('achievedGoal')
					}
					nodeArray.push(node)
				}
				// 获取datastore
				let datastoreSet = root.getElementsByTagName('bpmn:dataStoreReference')
				for (let i = 0; i < datastoreSet.length; i++) {
					let datastore = datastoreSet[i]
					let node = {}
					node.key = datastore.id
					node.category = 'datastore'
					if (datastore.getAttribute('name') !== null) {
						node.text = datastore.getAttribute('name').toString()
					}
					let bound = xmldoc.getElementById(datastore.id + '_di').getElementsByTagName('dc:Bounds')[0]
					let locX = bound.getAttribute('x').toString()
					let locY = bound.getAttribute('y').toString()
					node.loc = locX + ' ' + locY
					if (datastore.getAttribute('group') !== null) {
						node.group = datastore.getAttribute('group').toString()
					}
					if (datastore.getAttribute('alias') !== null) {
						node.Name = datastore.getAttribute('alias').toString()
					}
					if (datastore.getAttribute('annotation') !== null) {
						node.Annotation = datastore.getAttribute('annotation')
					}
					if (datastore.getAttribute('achievedGoal') !== null) {
						node.achievedGoal = datastore.getAttribute('achievedGoal')
					}
					nodeArray.push(node)
				}
				// 获取annotation
				let annotationSet = root.getElementsByTagName('bpmn:textAnnotation')
				for (let i = 0; i < annotationSet.length; i++) {
					let annotation = annotationSet[i]
					let node = {}
					node.key = annotation.id
					node.category = 'annotation'
					if (annotation.getElementsByTagName('bpmn:text').length > 0) {
						// console.log('nodevalue', annotation.getElementsByTagName('bpmn:text')[0])
						// console.log('nodevalue', annotation.getElementsByTagName('bpmn:text')[0].textContent)
						node.text = annotation.getElementsByTagName('bpmn:text')[0].textContent
					}
					let bound = xmldoc.getElementById(annotation.id + '_di').getElementsByTagName('dc:Bounds')[0]
					let locX = bound.getAttribute('x').toString()
					let locY = bound.getAttribute('y').toString()
					node.loc = locX + ' ' + locY
					if (annotation.getAttribute('group') !== null) {
						node.group = annotation.getAttribute('group').toString()
					}
					if (annotation.getAttribute('alias') !== null) {
						node.Name = annotation.getAttribute('alias').toString()
					}
					if (annotation.getAttribute('annotation') !== null) {
						node.Annotation = annotation.getAttribute('annotation')
					}
					if (annotation.getAttribute('achievedGoal') !== null) {
						node.achievedGoal = annotation.getAttribute('achievedGoal')
					}
					nodeArray.push(node)
				}
				// 获取普通边
				let sequenceFlowSet = root.getElementsByTagName('bpmn:sequenceFlow')
				for (let i = 0; i < sequenceFlowSet.length; i++) {
					let sequenceFlow = sequenceFlowSet[i]
					let link = {}
					link.from = parseInt(sequenceFlow.getAttribute('sourceRef').toString())
					link.to = parseInt(sequenceFlow.getAttribute('targetRef').toString())
					if (sequenceFlow.getAttribute('visible') === 'true') {
						link.visible = true
					} else if (sequenceFlow.getAttribute('visible') === 'false') {
						link.visible = false
					}
					let pointsSet = []
					let waypoints = xmldoc.getElementById(sequenceFlow.id + '_di').getElementsByTagName('di:waypoint')
					for (let j = 0; j < waypoints.length; j++) {
						let pointX = parseFloat(waypoints[j].getAttribute('x'))
						let pointY = parseFloat(waypoints[j].getAttribute('y'))
						pointsSet.push(pointX)
						pointsSet.push(pointY)
					}
					link.points = pointsSet
					if (sequenceFlow.getAttribute('isDefault') === 'true') {
						link.isDefault = true
					} else if (sequenceFlow.getAttribute('isDefault') === 'false') {
						link.isDefault = false
					}
					if (sequenceFlow.getAttribute('name') !== null) {
						link.text = sequenceFlow.getAttribute('name').toString()
					}

					linkArray.push(link)
				}
				// 获取msg边
				let messageSet = root.getElementsByTagName('bpmn:messageFlow')
				for (let i = 0; i < messageSet.length; i++) {
					let message = messageSet[i]
					let link = {}
					link.category = 'msg'
					link.from = parseInt(message.getAttribute('sourceRef').toString())
					link.to = parseInt(message.getAttribute('targetRef').toString())
					let pointsSet = []
					let waypoints = xmldoc.getElementById(message.id + '_di').getElementsByTagName('di:waypoint')
					for (let j = 0; j < waypoints.length; j++) {
						let pointX = parseFloat(waypoints[j].getAttribute('x'))
						let pointY = parseFloat(waypoints[j].getAttribute('y'))
						pointsSet.push(pointX)
						pointsSet.push(pointY)
					}
					link.points = pointsSet
					linkArray.push(link)
				}
				// 获取annotation边
				let associationSet = root.getElementsByTagName('bpmn:association')
				for (let i = 0; i < associationSet.length; i++) {
					let association = associationSet[i]
					let link = {}
					link.from = parseInt(association.getAttribute('sourceRef').toString())
					link.to = parseInt(association.getAttribute('targetRef').toString())
					link.category = 'annotation'
					let pointsSet = []
					let waypoints = xmldoc.getElementById(association.id + '_di').getElementsByTagName('di:waypoint')
					for (let j = 0; j < waypoints.length; j++) {
						let pointX = parseFloat(waypoints[j].getAttribute('x'))
						let pointY = parseFloat(waypoints[j].getAttribute('y'))
						pointsSet.push(pointX)
						pointsSet.push(pointY)
					}
					link.points = pointsSet
					linkArray.push(link)
				}
				// 获取bpmn:dataInputAssociation
				let dataAssociationSet = root.getElementsByTagName('bpmn:dataInputAssociation')
				for (let i = 0; i < dataAssociationSet.length; i++) {
					let dataAssociation = dataAssociationSet[i]
					let link = {}
					link.from = parseInt(dataAssociation.getElementsByTagName('bpmn:sourceRef')[0].textContent)
					link.to = parseInt(dataAssociation.parentElement.id)
					link.category = 'data'
					let pointsSet = []
					let waypoints = xmldoc.getElementById(dataAssociation.id + '_di').getElementsByTagName('di:waypoint')
					for (let j = 0; j < waypoints.length; j++) {
						let pointX = parseFloat(waypoints[j].getAttribute('x'))
						let pointY = parseFloat(waypoints[j].getAttribute('y'))
						pointsSet.push(pointX)
						pointsSet.push(pointY)
					}
					link.points = pointsSet
					linkArray.push(link)
				}
				// 获取bpmn:dataOutputAssociation
				let dataOutputAssociationSet = root.getElementsByTagName('bpmn:dataOutputAssociation')
				for (let i = 0; i < dataOutputAssociationSet.length; i++) {
					let dataAssociation = dataOutputAssociationSet[i]
					let link = {}
					link.from = parseInt(dataAssociation.parentElement.id)
					link.to = parseInt(dataAssociation.getElementsByTagName('bpmn:targetRef')[0].textContent)
					// console.log('from', link.from, 'to', link.to)
					link.category = 'data'
					let pointsSet = []
					let waypoints = xmldoc.getElementById(dataAssociation.id + '_di').getElementsByTagName('di:waypoint')
					for (let j = 0; j < waypoints.length; j++) {
						let pointX = parseFloat(waypoints[j].getAttribute('x'))
						let pointY = parseFloat(waypoints[j].getAttribute('y'))
						pointsSet.push(pointX)
						pointsSet.push(pointY)
					}
					link.points = pointsSet
					linkArray.push(link)
				}
				json.nodeDataArray = nodeArray
				json.linkDataArray = linkArray
				// console.log(JSON.stringify(json))
				return JSON.stringify(json)
			},
			XML2Json(xmlText) {
				let xotree = new XML.ObjTree()
				let jsonObject = xotree.parseXML(xmlText).myData
				let nodeArr = []
				let linkArr = []
				let jsonText

				if (jsonObject.nodeDataArray) {
					if (!(jsonObject.nodeDataArray instanceof Array)) {
						nodeArr.push(jsonObject.nodeDataArray)
						jsonObject.nodeDataArray = nodeArr
					}
				}
				if (jsonObject.linkDataArray != null) {
					if (!(jsonObject.linkDataArray instanceof Array)) {
						linkArr.push(jsonObject.linkDataArray)
						jsonObject.linkDataArray = linkArr
					}
				}
				for (let node of jsonObject.nodeDataArray) {
					if (node.isUnderline === 'false') {
						node.isUnderline = false
					} else {
						node.isUnderline = true
					}
					if (node.isStrikethrough === 'false') {
						node.isStrikethrough = false
					} else {
						node.isStrikethrough = true
					}
					node.strokeWidth = parseInt(node.strokeWidth)
					node.width = parseInt(node.width)
					node.height = parseInt(node.height)
					if (node.strokeDashArray) {
						node.strokeDashArray.forEach(function(v, i, a) {
							a[i] = parseInt(v)
						})
					}
				}
				jsonText = JSON.stringify(jsonObject)
				return jsonText
			},

			loadFile(files) {
				if (this.imFile) {
					let name = this.imFile.name
					let reader = new FileReader()
					reader.onload = () => {
						if (name.indexOf('.xml') !== (-1)) {
							console.log(this.imFile.name)
							this.load(this.BPMNxml2Json(reader.result))
						} else if (name.indexOf('.json') !== (-1)) {
							this.load(reader.result)
						}
					}
					reader.readAsText(this.imFile)
				}
			},

			doSave(value, type, name) {
				let blob
				if (typeof window.Blob === 'function') {
					blob = new Blob([value], {
						type: type
					})
				} else {
					let BlobBuilder = window.BlobBuilder || window.MozBlobBuilder || window.WebKitBlobBuilder || window.MSBlobBuilder
					let bb = new BlobBuilder()
					bb.append(value)
					blob = bb.getBlob(type)
				}
				let URL = window.URL || window.webkitURL
				let bloburl = URL.createObjectURL(blob)
				let anchor = document.createElement('a')
				if ('download' in anchor) {
					anchor.style.visibility = 'hidden'
					anchor.href = bloburl
					anchor.download = name
					document.body.appendChild(anchor)
					let evt = document.createEvent('MouseEvents')
					evt.initEvent('click', true, true)
					anchor.dispatchEvent(evt)
					document.body.removeChild(anchor)
				} else if (navigator.msSaveBlob) {
					navigator.msSaveBlob(blob, name)
				} else {
					location.href = bloburl
				}
			},

			handleEditorDivider(e) {
				this.moveCanvasCenter()
				let mySelf = this
				document.onmousemove = function(e) {
					const globalX = document.body.scrollWidth
					let mouseX = e.clientX
					let md = Math.round(mouseX / (globalX / 12))
					if (md < 1) md = 1
					if (md > 11) md = 11
					mySelf.sideBarmd = md
					return false
				}
				document.onmouseup = function() {
					document.onmousemove = null
					document.onmouseup = null
				}
			},
			moveToFolder() {
				this.$ajax.put('api/diagram', {
						'diagramId': this.diagram.diagramId,
						'folderId': this.folderId
					})
					.then((response) => {
						console.log(response)
						const code = response.data.code
						if (code === 1) {
							alert('保存成功')
						}
					})
					.catch((error) => {
						alert('保存失败，请重试')
						console.log(error)
					})
			},
			moveCanvasCenter() {
				// TODO:对准图的中心
				/*
				  let l = Number.MAX_VALUE
				  let r = Number.MIN_VALUE
				  let h = Number.MIN_VALUE
				  let b = Number.MAX_VALUE
				  if (this.myDiagram === null) return
				  for (let n of this.myDiagram.model.nodeDataArray) {
				    let nn = n.loc.split(' ')
				    let x = parseInt(nn[0])
				    let y = parseInt(nn[1])
				    if (x < l)l = x
				    if (x > r)r = x
				    if (y < b)b = y
				    if (y > h)h = y
				  }
				  let p = new go.Point((r + l) / 2, (h + b) / 2)
				  this.myDiagram.position.set(p) */
			}
		}
	}
</script>

<style lang="scss" scoped>
	@import "../../assets/css/bootstrap.css";
	@import "../../assets/css/work.css";
	@import "../../assets/css/dropdown.css";
	@import "../../assets/css/DataInspector.css";

	/*去掉nav-margin*/
	.navbar {
		margin: 0 auto;
		height: 50px;
	}

	option {
		color: black !important;
	}

	#search-type {
		color: gray;
		margin-right: 9px;
	}

	#brand {
		line-height: 50px;
		font-weight: bold;
		padding: 0 15px;
		font-size: 24px;
		letter-spacing: -0.05em;
		color: #2c3e50;
	}

	.sidebar-collapse {
		height: 100%;
		overflow-y: auto;
	}

	.top-bar {
		min-height: 40px;
		margin: 0px;
		padding: 0px;
	}

	.sidebar-collapse>.nav {
		height: 100%;
		max-height: 800px;
		margin-left: -15px;
		padding-left: 15px;
		background-color: #eee;
		border-right: 1px solid #D2D2D2;
		padding-top: 10px;
		overflow-y: scroll;
		overflow-x: hidden;
	}

	ul.collapse {
		border-top: 1px solid #D2D2D2;
		border-bottom: 1px solid #D2D2D2;
	}

	.sidebar-collapse>.nav>li {
		border-bottom: 1px solid #D2D2D2;
	}

	#myPaletteDiv {
		width: 100%;
		height: 100%;
		display: inline-block;
	}

	::-webkit-scrollbar {
		width: 5px;
		/* 纵向滚动条*/
		height: 5px;
		/* 横向滚动条 */
		background-color: #fff;
	}

	/*定义滚动条轨道 内阴影*/
	::-webkit-scrollbar-track {
		-webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0);
		background-color: #fff;
	}

	/*定义滑块 内阴影*/
	::-webkit-scrollbar-thumb {
		-webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0);
		background-color: #D5D5D5;
	}
</style>
