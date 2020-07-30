<template>
  <div style="height: 100%;">
    <b-navbar toggleable="lg" type="dark" variant="primary " style="padding: 4px 16px;">
      <b-navbar-brand id="brand">
        <img src="../../assets/WHU.png" alt="武汉大学" width="40" height="40" class="logo-image">
      </b-navbar-brand>
      <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>
      <b-collapse id="nav-collapse" is-nav>
        <b-navbar-nav>
          <b-nav-item-dropdown  :text="$t('CSDM.file')" no-caret>
            <b-dropdown-item class="rename">
              <font-awesome-icon icon="file-medical-alt"/>
              <span>{{$t('CSDM.rename')}}</span></b-dropdown-item>

            <b-dropdown-item v-b-modal="'moveFileModal'">
              <font-awesome-icon icon="folder"/>
              <span>{{$t('CSDM.move-to')}}</span></b-dropdown-item>

            <b-modal id="moveFileModal" size="sm" @ok="moveToFolder">
              <b-form-group :label="$t('CSDM.choose-import-file')">
                <b-form-select v-model="folderId" :options="folders"></b-form-select>
              </b-form-group>
              <div slot="modal-ok">{{$t('CSDM.ok')}}</div>
              <div slot="modal-cancel">{{$t('CSDM.cancel')}}</div>
            </b-modal>

            <b-dropdown-item v-b-modal="'importModal'">
              <font-awesome-icon icon="upload"/>
              <span>{{$t('CSDM.import')}}</span></b-dropdown-item>
            <b-modal id="importModal" size="sm" @ok="loadFile">
              <b-form-group :label="$t('CSDM.choose-import-file')">
                <b-form-file v-model="imFile" accept=".xml, .json"></b-form-file>
              </b-form-group>
              <div slot="modal-ok">{{$t('CSDM.import')}}</div>
              <div slot="modal-cancel">{{$t('CSDM.cancel')}}</div>
            </b-modal>
            <b-dropdown-item v-b-modal="'outportModal'">
              <font-awesome-icon icon="download"/>
              <span>{{$t('CSDM.export')}}</span></b-dropdown-item>
            <b-modal id="outportModal" size="sm" @ok="outportFile">
              <b-form-group :label="$t('CSDM.choose-export-format')">
                <b-form-radio v-model="selectedFormat" name="orad" value="RDF">RDF file</b-form-radio>
                <b-form-radio v-model="selectedFormat" name="orad" value="XML">XML file</b-form-radio>
                <b-form-radio v-model="selectedFormat" name="orad" value="JSON">JSON file</b-form-radio>
                <b-form-radio v-model="selectedFormat" name="orad" value="PNG">PNG format iamge</b-form-radio>
                <b-form-radio v-model="selectedFormat" name="orad" value="SVG">SVG file</b-form-radio>
              </b-form-group>
              <div slot="modal-ok">{{$t('CSDM.export')}}</div>
              <div slot="modal-cancel">{{$t('CSDM.cancel')}}</div>
            </b-modal>
            <b-dropdown-item v-if="curDiagramType === 'GN'"  @click="mixGoalFile">
              <font-awesome-icon icon="star"/>
              <span>融合目标模型</span></b-dropdown-item>
            <b-dropdown-item @click="$router.back(-1)">
              <font-awesome-icon icon="window-close"/>
              <span>{{$t('CSDM.exit')}}</span></b-dropdown-item>
          </b-nav-item-dropdown>
          <b-nav-item-dropdown :text="$t('CSDM.edit')" no-caret>
            <b-dropdown-item @click="saveDiagram">
              <font-awesome-icon icon="save"/>
              {{$t('CSDM.save')}}
            </b-dropdown-item>
            <b-dropdown-divider></b-dropdown-divider>
            <b-dropdown-item @click="undo">
              <font-awesome-icon icon="undo-alt"/>
              {{$t('CSDM.undo')}}
            </b-dropdown-item>
            <b-dropdown-item @click="redo">
              <font-awesome-icon icon="redo-alt"/>
              {{$t('CSDM.redo')}}
            </b-dropdown-item>
            <b-dropdown-divider></b-dropdown-divider>
            <b-dropdown-item @click="cutSelection">
              <font-awesome-icon icon="cut"/>
              {{$t('CSDM.cut')}}
            </b-dropdown-item>
            <b-dropdown-item @click="copySelection">
              <font-awesome-icon icon="copy"/>
              {{$t('CSDM.copy')}}
            </b-dropdown-item>
            <b-dropdown-item @click="pasteSelection">
              <font-awesome-icon icon="paste"/>
              {{$t('CSDM.paste')}}
            </b-dropdown-item>
            <b-dropdown-divider></b-dropdown-divider>
            <b-dropdown-item @click="groupSelection">
              <font-awesome-icon icon="object-group"/>
              {{$t('CSDM.group')}}
            </b-dropdown-item>
            <b-dropdown-item @click="ungroupSelection()">
              <font-awesome-icon icon="object-ungroup"/>
              {{$t('CSDM.ungroup')}}
            </b-dropdown-item>
          </b-nav-item-dropdown>
          <b-nav-item-dropdown  :text="$t('CSDM.grid')" no-caret>
            <b-form-group class="group">
              <b-form-select
                v-model="selectGrid"
                :options="selectGrids"
                stacked
              ></b-form-select>
            </b-form-group>
          </b-nav-item-dropdown>
          <!-- 页面部分-->
          <b-nav-item-dropdown :text="$t('CSDM.help')" no-caret>
            <b-dropdown-item>{{$t('CSDM.shortcut-key-overview')}}</b-dropdown-item>
          </b-nav-item-dropdown>
        </b-navbar-nav>
        <!--重命名-->
        <b-navbar-nav >
          <span class="navbar-brand rename" id="project-name" ref="projectName" v-b-tooltip.hover title="Click to rename this project">{{diagram.diagramName}}</span>
        </b-navbar-nav>
        <!--融合文件名称-->
        <b-navbar-nav v-show="isSubShow">
          <span class="navbar-brand rename"   v-b-tooltip.hover >辅领域模型:</span>
          <span class="navbar-brand rename" id="mixproject-name"  v-b-tooltip.hover >{{mixdiagramName}}</span>
          <span class="navbar-brand rename"   v-b-tooltip.hover >匹配相似度: {{mixdiagramSimilarity}}</span>
        </b-navbar-nav>
        <!--// TODO 搜索框align-right-->
        <b-navbar-nav class= 'ml-auto' style="float: right" >
          <b-nav-form>
            <b-form-input  size="sm" class="mr-sm-2" :placeholder="$t('CSDM.search_content')" id="search-content" v-model="search_content">{{search_content}}}</b-form-input>
            <b-form-select  id="search-type" v-model="search_type" :options="search_types">
            </b-form-select>
            <b-button size="sm" class="my-2 my-sm-0" type="button" @click="search">{{$t('CSDM.search')}}</b-button>
          </b-nav-form>
        </b-navbar-nav>
      </b-collapse>
    </b-navbar>
    <b-nav justified>
      <b-nav-item v-b-modal="'saveModal'"><a v-b-tooltip.hover :title="$t('CSDM.exit')"><font-awesome-icon icon="arrow-circle-left"/></a></b-nav-item>
      <b-modal id="saveModal" @ok="saveDiagram(true)" @cancel="$router.back(-1)">
        {{$t('CSDM.choose-save-content')}}
        <div slot="modal-ok">{{$t('CSDM.yes')}}</div>
        <div slot="modal-cancel">{{$t('CSDM.no')}}</div>
      </b-modal>
      <b-nav-item style="min-width: 150px">
        <b-form-select v-model="selectedFont" @change="changeFont" >
          <option value="Times New Roman">Times New Roman</option>
          <option value="Helvetica">Helvetica</option>
          <option value="宋体">宋体</option>
          <option value="楷体">楷体</option>
          <option value="隶书">隶书</option>
          <option value="微软雅黑">微软雅黑</option>
          <option value="华文仿宋">华文仿宋</option>
          <option value="华文楷体">华文楷体</option>
          <option value="幼圆">幼圆</option>
        </b-form-select>
      </b-nav-item>
      <b-nav-item style="min-width: 100px">
        <b-form-select v-model="selectedSize" @change="changeFont" >
          <option value="6pt">6pt</option>
          <option value="7pt">7pt</option>
          <option value="8pt">8pt</option>
          <option value="9pt">9pt</option>
          <option value="10pt">10pt</option>
          <option value="11pt">11pt</option>
          <option value="12pt">12pt</option>
          <option value="13pt">13pt</option>
          <option value="14pt">14pt</option>
          <option value="15pt">15pt</option>
        </b-form-select>
      </b-nav-item>
      <b-nav-item @click="largerSize"><font-awesome-icon icon="font" size="lg" v-b-tooltip.hover :title="$t('CSDM.enlarge-font-size')"/></b-nav-item>
      <b-nav-item @click="smallerSize"><font-awesome-icon icon="font" v-b-tooltip.hover :title="$t('CSDM.narrow-font-size')"/></b-nav-item>
      <b-dropdown-divider></b-dropdown-divider>
      <b-nav-item @click="boldFont"><font-awesome-icon icon="bold" v-b-tooltip.hover :title="$t('CSDM.text-bold')"/></b-nav-item>
      <b-nav-item @click="italicFont"><font-awesome-icon icon="italic" v-b-tooltip.hover :title="$t('CSDM.text-italics')"/></b-nav-item>
      <b-nav-item @click="underlineFont"><font-awesome-icon icon="underline" v-b-tooltip.hover :title="$t('CSDM.underline')"/></b-nav-item>
      <b-nav-item @click="strikethroughFont"><font-awesome-icon icon="strikethrough" v-b-tooltip.hover :title="$t('CSDM.strikethrough')"/></b-nav-item>
      <b-dropdown-divider></b-dropdown-divider>
      <b-nav-item @click="$refs.fill.click()"><font-awesome-icon icon="tint" v-b-tooltip.hover :title="$t('CSDM.fill')"/></b-nav-item>
      <b-dropdown-divider></b-dropdown-divider>
      <b-nav-item @click="showGrid"><font-awesome-icon icon="th" v-b-tooltip.hover :title="$t('CSDM.grid')"/></b-nav-item>
      <b-dropdown-divider></b-dropdown-divider>
      <b-nav-item class="reportEditor"><font-awesome-icon icon="file" v-b-tooltip.hover :title="$t('CSDM.report-editor')"/></b-nav-item>
      <b-dropdown-divider></b-dropdown-divider>
      <b-nav-item @click="diagramCheck"><font-awesome-icon icon="bug" v-b-tooltip.hover :title="$t('CSDM.consistency-check')"/></b-nav-item>
    </b-nav>

    <b-row style="position:absolute;top: 96px;bottom: 20px;left: 0px;right: 0px;">

      <!-- 侧边栏 -->
      <b-col v-show="showSideBar" :md="sideBarmd" style="height: 100%">
        <b-list-group class="sidebar-collapse" role="tablist">
          <b-card no-body>
            <b-card-header header-tag="header" class="p-1" role="tab">
              <b-button block href="" v-b-toggle.my-collapse variant="light">{{modelType}}<span class="caret"></span></b-button>
            </b-card-header>
            <b-collapse id="my-collapse" visible accordion="my-accordion" role="tabpanel">
              <b-card-body>
                <div id="myPaletteDiv1" style="height:350px;"></div>
              </b-card-body>
            </b-collapse>
          </b-card>
          <b-card no-body>
            <b-card-header header-tag="header" class="p-1" role="tab">
              <b-button block href="" v-b-toggle.my-collapse2 variant="light">{{relationType}}<span class="caret"></span></b-button>
            </b-card-header>
            <b-collapse id="my-collapse2" visible accordion="my-accordion" role="tabpanel">
              <b-card-body>
                <div id="myPaletteDiv2" style="height:350px;"></div>
              </b-card-body>
            </b-collapse>
          </b-card>

          <b-card no-body>
            <b-card-header header-tag="header" class="p-1" role="tab">
              <b-button block href="" v-b-toggle.my-collapse3 variant="light">{{$t('CSDM.basic-elements')}}<span class="caret"></span></b-button>
            </b-card-header>
            <b-collapse id="my-collapse3" visible accordion="my-accordion" role="tabpanel">
              <b-card-body>
                <div id="myPaletteDiv3" style="height:350px;"></div>
              </b-card-body>
            </b-collapse>
          </b-card>

          <b-card no-body>
            <b-card-header header-tag="header" class="p-1" role="tab">
              <b-button block href="" v-b-toggle.my-collapse4 variant="light">{{$t('CSDM.basic-rela')}}<span class="caret"></span></b-button>
            </b-card-header>
            <b-collapse id="my-collapse4" visible accordion="my-accordion" role="tabpanel">
              <b-card-body>
                <div id="myPaletteDiv4" style="height:350px;"></div>
              </b-card-body>
            </b-collapse>
          </b-card>

          <b-card no-body>
            <b-card-header header-tag="header" class="p-1" role="tab">
                <b-button block href="" v-b-toggle="'mySearchCollapse' + index " @click="showChooseModel()" variant="light">
                  {{chooseText}}<span class="caret"></span>
                </b-button>
            </b-card-header>
            <b-card-header header-tag="header" :class=" 'p-1 '+activeclass" role="tab">
              <b-button v-for="(item, index) in search_diagram_json " :key="index" :class="btnClick" block href="" v-b-toggle="'mySearchCollapse' + index " @click="createSearchDiagram(item,index)" variant="light">
                {{btnText + '' + parseInt(index + 1)}}<span class="caret"></span>
              </b-button>
            </b-card-header>
          </b-card>

          <b-card no-body v-for="(item, index) in search_diagram_json " :key="index">
            <!-- 下面这个区域的作用是存放模板片段的视野图 -->
            <b-collapse class="boxModel" v-bind:id="'mySearchCollapse' + index " accordion="my-accordion" role="tabpanel">
              <b-card-body>
                <div v-bind:id="'mySearchDiagram' + index" style="height:350px;"></div>
              </b-card-body>
            </b-collapse>
          </b-card>
        </b-list-group>

      </b-col>
      <!-- 分隔栏 -->
      <div style="cursor: w-resize;width: 5px;background: #D2D2D2" @mousedown="handleEditorDivider"></div>
      <!-- diagram -->
      <b-col style="height: 100%">
        <div id="myDiagramDiv"  style="height: 100%; background-color: whitesmoke;"></div>
        <div  :style="{marginLeft: splitLine}"></div>

        <div style="position: absolute;border: 1px solid #D2D2D2;background-color: #f5f5f5;top:0px;z-index:100;margin-left: 0px;">
          <button :title="$t('CSDM.fold-sidebar')" class="tool-bar-btn" @click="showSideBar=!showSideBar;moveCanvasCenter();"><i class="fas fa-bars"></i></button>
        </div>
        <div id="dock">
          <div class="dock-header"></div>
          <div class="dock-buttons">
            <div id="dock-btn-navigator" title="Navigator" class="tool-bar-btn" @click="setDock(1)"><i class="fa fa-crosshairs"></i></div>
            <div id="dock-btn-graphic" title="Graphic" class="tool-bar-btn" @click="setDock(2)"><i class="fa fa-chart-bar"></i></div>
            <div id="dock-btn-attribute" title="Data Attributes" class="tool-bar-btn" @click="setDock(3)"><i class="fa fa-table"></i></div>
            <div id="dock-btn-error" title="Error Log" class="tool-bar-btn" @click="setDock(4)"><i class="fa fa-exclamation-triangle"></i></div>
          </div>
        </div>
        <div class="dock-view" :class="[shownDock===1?'open':'']" id="navigator-view">
          <div class="view-title"><span>{{$t('CSDM.navigation')}}</span></div>
          <div class="view-body">
            <div id="diagramOverview"></div>
          </div>
        </div>
        <div class="dock-view" :class="[shownDock===2?'open':'']" id="graphic-view">
          <div class="view-title"><span>{{$t('CSDM.graph')}}</span></div>
          <div class="view-body">
            <div class="stroke">
              <span>{{$t('CSDM.stroke')}}</span>
              <input type="color" ref="strokeColor" @change="changeStrokeColor"/>
              <select name="strokeStyle" v-model="strokeStyle" @change="changeStrokeStyle">
                <option value="solid">———</option>
                <option value="dashed">--------</option>
                <option value="dotted">········</option>
              </select>
            </div>
            <div>
              <span>{{$t('CSDM.fill')}}</span><input type="color" ref="fill" @change="fillBackground"/>
            </div>
            <div class="isCrossover">
              <span>{{$t('CSDM.whether-crossover-service')}}</span>
              <select name="isCrossover" v-model="isCrossover" @change="changeCrossover">
                <option value="true">true</option>
                <option value="false">false</option>
              </select>
            </div>
          </div>
        </div>
        <div class="dock-view" :class="[shownDock===3?'open':'']" id="attribute-view">
          <div class="view-title"><span>{{$t('CSDM.data-attribute')}}</span></div>
          <div class="view-body">
            <div id="attributeTable">
            </div>
          </div>
        </div>
        <div class="dock-view" :class="[shownDock===4?'open':'']" id="error-view">
          <div class="view-title"><span>{{$t('CSDM.error-log')}}</span></div>
          <div class="view-body">
            <div id="errorTable">
              <table border="1">
                <thead>
                <tr>
                  <th style="text-align: center">{{$t('CSDM.error')}}</th>
                  <th style="text-align: center">{{$t('CSDM.amendment')}}</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="(error,index) in errors" :key="index">
                  <td v-text="error[0]"></td>
                  <td v-text="error[1]"></td>
                </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </b-col>
      <div style="cursor: w-resize;width: 5px;background: #D2D2D2" @mousedown="handleEditorDivider2"></div>
      <b-col v-show="isMixed" :md="rightSideBar" style="height: 100%">
        <b-list-group class="sidebar-collapse" role="tablist">
          <b-card no-body>
            <b-card-header header-tag="header" class="p-1" role="tab">
<!--              <b-button block  variant="light" @click="identifyRedBox">寻找用户新目标<span class="caret"></span></b-button>-->
              <b-button block  v-b-toggle.my-collapse5 variant="light" :disabled="isDis1">获取目标模型<span class="caret"></span></b-button>
<!--              <b-button block  v-b-toggle.my-collapse5 variant="light" :disabled="isDis1">Matching Object Domain Goal Model<span class="caret"></span></b-button>-->
            </b-card-header>
            <b-collapse id="my-collapse5" visible accordion="my-accordion" role="tabpanel">
              <b-card-body>
                <b-button block  variant="light" @click="identifyGoalBox"  :disabled="isDisable1" v-b-modal="'chooseMixGoal'">重构主体领域</b-button>
                <b-button block  variant="light" @click="importSubModel" :disabled="isDisable2">匹配客体领域</b-button>
                <b-modal id="chooseMixGoal" size="sm" @ok="chooseMixGoal">
                  <b-form-group label="请选择待融合用户目标">
                    <b-form-select v-model="userGoalKey" :options="mixUserGoals"></b-form-select>
                  </b-form-group>
                  <b-form-group label="请选择待融合依赖目标">
                    <b-form-select v-model="depdGoalKey" :options="mixDepdGoals"></b-form-select>
                  </b-form-group>
                  <div slot="modal-ok">{{$t('CSDM.ok')}}</div>
                  <div slot="modal-cancel">{{$t('CSDM.cancel')}}</div>
                </b-modal>
              </b-card-body>
            </b-collapse>
          </b-card>
          <b-card no-body>
            <b-card-header header-tag="header" class="p-1" role="tab">
<!--              <b-button block @click="deleteSubModel" variant="light">融合用户目标模型<span class="caret"></span></b-button>-->
              <b-button block href="" v-b-toggle.my-collapse6 variant="light" :disabled="isDis2" @click="secondStep">融合用户目标<span class="caret"></span></b-button>
<!--              <b-button block href="" v-b-toggle.my-collapse6 variant="light" :disabled="isDis2" @click="secondStep">User Actor Goal Convergence<span class="caret"></span></b-button>-->
            </b-card-header>
            <b-collapse id="my-collapse6" visible accordion="my-accordion" role="tabpanel">
              <b-card-body>
<!--                <b-button block  variant="light" @click="identifySubRedBox" :disabled="isDisable1">融合相似目标</b-button>-->
                <b-button block  variant="light" @click="generateTemplateFrag" v-b-modal="'tips'" :disabled="isDisable1">融合相似目标</b-button>
                <b-modal id="tips" size="sm" ok-only>请移动合适的片段进行融合</b-modal>
              </b-card-body>
            </b-collapse>
          </b-card>

          <b-card no-body>
            <b-card-header header-tag="header" class="p-1" role="tab">
              <b-button block href="" v-b-toggle.my-collapse7 variant="light" :disabled="isDis3" @click="thirdStep">融合依赖者<span class="caret"></span></b-button>
<!--              <b-button block href="" v-b-toggle.my-collapse7 variant="light" :disabled="isDis3" @click="thirdStep">Dependee Actor Goal Convergence<span class="caret"></span></b-button>-->
            </b-card-header>
            <b-collapse id="my-collapse7" visible accordion="my-accordion" role="tabpanel">
              <b-card-body>
                <b-button block  variant="light" @click="identifyDependent" :disabled="isDisable1">添加依赖者</b-button>
                <b-button block  variant="light"  v-b-modal="'tips2'" @click="mixedDependent" :disabled="isDisable2">匹配相似目标</b-button>
                <b-modal id="tips2" size="sm" ok-only><h3>请移动合适的片段进行融合:</h3>
                  <h5>1. 为依赖者建立依赖关系:用户依赖于{{deps}} , {{deps}}依赖于{{depo}}</h5>
                  <h5>2. 生成跨服务目标</h5></b-modal>
              </b-card-body>
            </b-collapse>
          </b-card>
          <b-card no-body>
            <b-card-header header-tag="header" class="p-1" role="tab">
              <b-button block v-b-toggle.my-collapse8 variant="light"  @click="fourthStep" :disabled="isDis4">不一致性检测<span class="caret"></span></b-button>
<!--              <b-button block v-b-toggle.my-collapse8 variant="light" v-b-modal="'tips3'" @click="checkInconsistency" :disabled="isDis4">Inconsistencies Detection and Conflicts Resolution<span class="caret"></span></b-button>-->
              <b-modal id="tips3" size="sm" ok-only>
                <h3>请修改相应冲突的片段</h3>
             </b-modal>
            </b-card-header>
            <b-collapse id="my-collapse8" visible accordion="my-accordion" role="tabpanel">
              <b-card-body>
                <b-button block  variant="light" @click="preprocess" :disabled="isDisable1" v-b-modal="'tips3'">预处理</b-button>
                <div v-show="toggle2">
                  <b-button block  variant="light"  @click="toggle3=!toggle3" >处理意见<span class="caret"></span></b-button>
                </div>
                <br>
                <div v-show="toggle3">
                  <b-table responsive :items="processItems" :fields="fields"  bordered=true sticky-header="true" head-variant="light" primary-key="id" >
                  </b-table>
                  <br>
                </div>
                <b-button block  variant="light" @click="checkInconsistency" :disabled="isDisable2" v-b-modal="'tips3'">冲突检测</b-button>
                <div v-show="toggle1">
                  <b-button block  variant="light"  @click="toggle=!toggle" >检测结果<span class="caret"></span></b-button>
                </div>
                <br>
                <div v-show="toggle">
                    <b-table responsive :items="items" :fields="fields"  bordered=true sticky-header="true" head-variant="light" primary-key="id" >
                    </b-table>
                  </div>
              </b-card-body>
            </b-collapse>
          </b-card>
          <b-card no-body>
            <b-card-header header-tag="header" class="p-1" role="tab">
              <b-button block href=""  variant="light" @click="deleteSubModel" :disabled="isDis5">删除辅模型</b-button>
<!--              <b-button block href=""  variant="light" @click="deleteSubModel" :disabled="isDis5">Delete Object Domain Goal Model</b-button>-->
            </b-card-header>
          </b-card>
        </b-list-group>

      </b-col>

    </b-row>
    <div id="editor">
      <div class="row">
        <span id="editorHandle" class="col-md-10">{{$t('CSDM.specification-document')}}</span>
        <span><a href="javascript:void(0)" class="col-md-1" id="downloadBtn"><i class="fas fa-download fa-fw" :title="$t('CSDM.export')"></i></a></span>
        <span id="editorClose" class="col-md-1"><a href="javascript:void(0)" id="closeBtn"><i class="fas fa-window-close fa-fw" :title="$t('CSDM.close')"></i></a></span>

      </div>
      <kind-editor id="editor-id" :content="analyContent"></kind-editor>
    </div>
  </div>
</template>
<script>
import { go } from 'gojs/release/go-module'
import 'gojs/extensions/Figures'
import { XML } from './components/ObjTree.js'
import { Inspector } from './components/DataInspector'
import KindEditor from './components/kindEditor'
const objGo = go.GraphObject.make

export default {
  name: 'CSDM',
  components: {KindEditor},
  data () {
    return {
      navbarFile: '文件',
      navbarSearchContent: '检索字段',
      navbarEdit: '编辑',
      visible1: true,
      curDiagramType: '',
      diagram: {diagramName: ''},
      isBold: false,
      isItalic: false,
      selectedFont: '',
      selectedSize: '',
      selectedFormat: '',
      myDiagram: null,
      imageData: null,
      modelType: '',
      relationType: '',
      shownDock: '',
      strokeStyle: '',
      isCrossover: '',
      errors: [],
      imFile: null,

      mixFile: null,
      roleAnalysis: '',
      selectGrid: null,
      selectGrids: [
        { text: 'null', value: null },
        { text: 'small', value: 'small-size' },
        { text: 'normal', value: 'normal-size' },
        { text: 'big', value: 'big-size' },
        { text: 'bigger', value: 'bigger-size' }
      ],
      flag_showgrid: true,
      search_content: '',
      search_type: null,
      search_types: [],
      search_diagram: [],
      search_diagram_json: [], // 渲染模板碎片
      showSideBar: true,
      sideBarmd: '2',
      rightSideBar: '2',
      folderId: null,
      folders: [{text: '根目录', value: null}],
      hideMapbox: false,
      activeclass: 'hidemapbox',
      chooseText: '请选择模板片段',
      chooseindex: -1,
      btnText: '模板片段',
      btnClick: 'nameBtn',
      projectRoles: [],
      isMixed: false,
      isSubShow: false,
      mixdiagramName: '',
      mixdiagramSimilarity: '',
      splitLine: 0.0,
      splitLineLocX: 0.0,
      userGoalKey: null,
      mixUserGoals: [],
      depdGoalKey: null,
      mixDepdGoals: [],
      isDis1: false,
      isDis2: true,
      isDis3: true,
      isDis4: true,
      isDis5: true,
      isDisable1: false,
      isDisable2: true,
      toggle2: false,
      toggle3: false,
      toggle1: false,
      toggle: false,
      deps: '',
      depo: '',
      newGoals: [],
      yellowGoals: [],
      processItems: [
        { id: 'null', type: 'null', name_1: 'null', name_2: 'null', solution: 'null' }
      ],
      fields: [
        {key: 'id',
          label: '冲突目标对',
          stickyColumn: true
        },
        {
          key: 'name_1',
          label: '目标1',
          stickyColumn: true
        },
        {
          key: 'name_2',
          label: '目标2',
          stickyColumn: true
        },
        {
          key: 'type',
          label: '冲突类型',
          sortable: true,
          stickyColumn: true
          // formatter: (value, key, item) => {
          //   switch (item.type) {
          //     case 1:
          //       return '软目标冲突'
          //     case 2:
          //       return '可操作性目标冲突'
          //     case 3:
          //       return '功能性目标冲突'
          //     case 4:
          //       return '非功能性目标冲突'
          //   }
          // }
        },
        {
          key: 'solution',
          label: '修改建议',
          sortable: false,
          stickyColumn: true
          // formatter: (value, key, item) => {
          //   switch (item.solution) {
          //     case 1:
          //       return '删除其中一个冲突目标'
          //     case 2:
          //       return '可操作性目标冲突'
          //     case 3:
          //       return '功能性目标冲突'
          //     case 4:
          //       return '非功能性目标冲突'
          //   }
          // }
        }
      ],
      // conflict: { type: '', goal_1: '', goal_2: '', solution: '' },
      items: [
        { id: 'null', type: 'null', name_1: 'null', name_2: 'null', solution: 'null' }
        // { id: 2, type: 2, name_1: 'Pay by credit card', name_2: 'Pay by credit card', solution: 1 },
        // { id: 3, type: 4, name_1: 'Convenient payment', name_2: 'Convenient payment', solution: 1 }
      ]
    }
  },
  computed: {
    analyContent: function () {
      return `<div>
    <div>
      <h3>1. 跨界服务概述</h3>
      <p><i><b>说明：</b>概要说明待开发的跨界服务是什么，开发背景和目的。</i></p>
    </div>
    <div>
      <h3>2. 跨界服务的价值网络与利益相关方分析</h3>
      <p><i><b>说明：</b>描述跨界服务业务场景中价值网络的构成，厘清价值网络中涉及的利益相关方（即角色，包括个体与组织），明确各个角色的价值诉求。</i></p>
      <div>
        <h4>2.1 价值网络描述</h4>
        <p><i><b>说明：</b>利用图形或文本描述价值网络的形成，包括哪些价值活动、哪些利益相关方及其之间的交互关系，跨越哪些行业领域等。</i></p>
        <p><img src="${this.imageData}" style="text-align:center;width:300px;height:300px" alt="建模图" /></p>
      </div>
      <div>
        <h4>2.2 利益相关方分析</h4>
        <p><i><b>说明：建议用下表的形式对价值网络中涉及的利益相关方（角色）进行分析。</b></i></p>
        <table border="1" cellpadding="5" cellspacing="5" style="font-size:13px" id="roleAnalysis">
          <thead>
            <tr><th colspan="4">角色分析表</th></tr>
            <tr>
              <th>角色类别</th>
              <th>角色说明</th>
              <th>价值诉求</th>
              <th>约束条件</th>
            </tr>
          </thead>
          <tbody>
          ${this.roleAnalysis}
          </tbody>
        </table>
      </div>
    </div>
    <div>
      <h3>3. 跨界服务的功能需求</h3>
      <div>
        <h4>3.1 典型用户的需求描述</h4>
        <p><img src="${this.imageData}" style="text-align:center;width:300px;height:300px" alt="建模图" /></p>
        <p><i><b>说明：</b>针对使用跨界服务的典型用户，描述其与服务交互的典型场景。</i></p>
        <table border="1" cellpadding="5" cellspacing="5" style="font-size:13px" id="needAnalysis">
            <tr><th colspan="4">典型用户的使用场景</th></tr>
            <tr>
              <th colspan="1">用户角色</th>
              <td colspan="3"></td>
            </tr>
            <tr>
              <th colspan="1">用户背景描述</th>
              <td colspan="3"></td>
            </tr>
            <tr>
              <th colspan="1">用户动机或目标</th>
              <td colspan="3"></td>
            </tr>
            <tr>
              <th colspan="1">用户偏好</th>
              <td colspan="3"></td>
            </tr>
            <tr>
              <th colspan="1">该类型用户的占比</th>
              <td colspan="3"></td>
            </tr>
            <tr>
              <th colspan="1">典型场景描述</th>
              <td colspan="3"></td>
            </tr>
        </table>
      </div>
      <div>
        <h4>3.2 跨界服务的整体业务流程图</h4>
        <p><i><b>说明：</b>利用面向跨界服务建模工具提供跨界服务的整体业务流程图</i></p>
      </div>
    </div>
    <div>
      <h3>4. 跨界服务的非功能需求</h3>
      <div>
        <h4>4.1 服务质量需求</h4>
        <p><i>提示：可以定量或定性描述，尽可能提供一部分定量描述指标</i></p>
        <table border="1" cellpadding="5" cellspacing="5" style="font-size:13px">
          <thead>
            <tr>
              <th>主要的质量属性</th>
              <th>详细要求</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>正确性</td>
              <td></td>
            </tr>
            <tr>
              <td>健壮性</td>
              <td></td>
            </tr>
            <tr>
              <td>可靠性</td>
              <td></td>
            </tr>
            <tr>
              <td>性能</td>
              <td></td>
            </tr>
            <tr>
              <td>易用性</td>
              <td></td>
            </tr>
            <tr>
              <td>清晰性</td>
              <td></td>
            </tr>
            <tr>
              <td>安全性</td>
              <td></td>
            </tr>
            <tr>
              <td>可扩展性</td>
              <td></td>
            </tr>
            <tr>
              <td>兼容性</td>
              <td></td>
            </tr>
            <tr>
              <td>可移植性</td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>`
    },
    listenChangemixed () {
      const {isMixed} = this
      return {isMixed}
    }
  },
  created () {
    if (this.$i18n.locale === 'en') {
      this.chooseText = 'Select The Template of Fragment'
    }
    var mySelf = this
    const id = this.$route.query.id
    this.curDiagramType = this.$route.query.diagramType
    this.$ajax.get('api/diagram', {
      params: {
        'diagramId': id
      }})
      .then((response) => {
        console.log(response)
        const code = response.data.code
        if (code === 1) {
          this.diagram = response.data.data
          this.folderId = this.diagram.folderId
          mySelf.$ajax.get('api/folder/roles', {
            params: {
              'folderId': mySelf.folderId
            }
          })
            .then((response) => {
              console.log(response)
              const code = response.data.code
              if (code === 1) {
                for (let role of response.data.data) {
                  mySelf.projectRoles.push(role.Name)
                }
              }
            })
            .catch((error) => {
              console.log(error)
            })
        }
      })
      .catch((error) => {
        console.log(error)
      })
    this.$ajax.get('api/folder')
      .then((response) => {
        console.log(response)
        const code = response.data.code
        if (code === 1) {
          for (let folder of response.data.data) {
            this.folders.push({text: folder.folderName, value: folder.folderId})
          }
        }
      })
      .catch((error) => {
        console.log(error)
      })
  },
  mounted () {
    const s = document.createElement('script')
    s.type = 'text/javascript'
    s.src = '/static/js/haha.js'
    document.body.appendChild(s)

    const mySelf = this

    mySelf.myDiagram =
        objGo(go.Diagram, 'myDiagramDiv',
          {
            initialContentAlignment: go.Spot.Center,
            allowDrop: true,
            // "toolManager.mouseWheelBehavior":go.ToolManager.WheelZoom,//鼠标滚轮可改变图标规模
            'draggingTool.dragsLink': true,
            'draggingTool.isGridSnapEnabled': true,
            'linkingTool.isUnconnectedLinkValid': true,
            'relinkingTool.isUnconnectedLinkValid': true,
            'linkingTool.linkValidation': checkLink,
            'relinkingTool.linkValidation': checkLink,
            'linkingTool.portGravity': 20,
            'relinkingTool.portGravity': 20,
            'relinkingTool.fromHandleArchetype':
              objGo(go.Shape, 'Diamond', { segmentIndex: 0, cursor: 'pointer', desiredSize: new go.Size(8, 8), fill: 'tomato', stroke: 'darkred' }),
            'relinkingTool.toHandleArchetype':
              objGo(go.Shape, 'Diamond', { segmentIndex: -1, cursor: 'pointer', desiredSize: new go.Size(8, 8), fill: 'darkred', stroke: 'tomato' }),
            'linkReshapingTool.handleArchetype':
              objGo(go.Shape, 'Diamond', { desiredSize: new go.Size(7, 7), fill: 'lightblue', stroke: 'deepskyblue' }),
            'rotatingTool.snapAngleMultiple': 15,
            'rotatingTool.snapAngleEpsilon': 15,
            'commandHandler.archetypeGroupData': { text: 'Group', isGroup: true, color: 'gray' },
            'undoManager.isEnabled': true
          }
        )

    function makePort (name, spot, output, input) {
      // the port is basically just a small transparent square
      return objGo(go.Shape, 'Circle',
        {
          fill: null, // not seen, by default; set to a translucent gray by showSmallPorts, defined below
          stroke: null,
          desiredSize: new go.Size(7, 7),
          alignment: spot, // align the port on the main Shape
          alignmentFocus: spot, // just inside the Shape
          portId: name, // declare this object to be a "port"
          fromSpot: spot,
          toSpot: spot, // declare where links may connect at this port
          fromLinkable: output,
          toLinkable: input, // declare whether the user may draw links to/from here
          cursor: 'pointer' // show a different cursor to indicate potential link point
        })
    }

    var nodeSelectionAdornmentTemplate =
        objGo(go.Adornment, 'Auto',
          objGo(go.Shape, { fill: null, stroke: 'deepskyblue', strokeWidth: 1.5, strokeDashArray: [4, 2] }),
          objGo(go.Placeholder)
        )

    var nodeResizeAdornmentTemplate =
        objGo(go.Adornment, 'Spot',
          { locationSpot: go.Spot.Right },
          objGo(go.Placeholder),
          objGo(go.Shape, { alignment: go.Spot.TopLeft, cursor: 'nw-resize', desiredSize: new go.Size(6, 6), fill: 'lightblue', stroke: 'deepskyblue' }),
          objGo(go.Shape, { alignment: go.Spot.Top, cursor: 'n-resize', desiredSize: new go.Size(6, 6), fill: 'lightblue', stroke: 'deepskyblue' }),
          objGo(go.Shape, { alignment: go.Spot.TopRight, cursor: 'ne-resize', desiredSize: new go.Size(6, 6), fill: 'lightblue', stroke: 'deepskyblue' }),
          objGo(go.Shape, { alignment: go.Spot.Left, cursor: 'w-resize', desiredSize: new go.Size(6, 6), fill: 'lightblue', stroke: 'deepskyblue' }),
          objGo(go.Shape, { alignment: go.Spot.Right, cursor: 'e-resize', desiredSize: new go.Size(6, 6), fill: 'lightblue', stroke: 'deepskyblue' }),
          objGo(go.Shape, { alignment: go.Spot.BottomLeft, cursor: 'se-resize', desiredSize: new go.Size(6, 6), fill: 'lightblue', stroke: 'deepskyblue' }),
          objGo(go.Shape, { alignment: go.Spot.Bottom, cursor: 's-resize', desiredSize: new go.Size(6, 6), fill: 'lightblue', stroke: 'deepskyblue' }),
          objGo(go.Shape, { alignment: go.Spot.BottomRight, cursor: 'sw-resize', desiredSize: new go.Size(6, 6), fill: 'lightblue', stroke: 'deepskyblue' })
        )

    const nodeRotateAdornmentTemplate =
        objGo(go.Adornment,
          { locationSpot: go.Spot.Center, locationObjectName: 'CIRCLE' },
          objGo(go.Shape, 'Circle', { name: 'CIRCLE', cursor: 'pointer', desiredSize: new go.Size(7, 7), fill: 'lightblue', stroke: 'deepskyblue' }),
          objGo(go.Shape, { geometryString: 'M0 3.5 L-50 3.5', isGeometryPositioned: true, stroke: 'deepskyblue', strokeWidth: 1.5, strokeDashArray: [4, 2] })
        )

    // eslint-disable-next-line no-unused-vars
    var myOwnPropertiesInspector = new Inspector('attributeTable', mySelf.myDiagram,
      {
        includesOwnProperties: false,
        properties: {
          'from': {readOnly: true, show: Inspector.showIfLink},
          'to': {readOnly: true, show: Inspector.showIfLink},
          'Linktype': {readOnly: true, show: Inspector.showIfLink},
          'Type': {readOnly: true, show: Inspector.showIfNode},
          'Name': {show: Inspector.showIfNode},
          'Annotation': {show: Inspector.showIfNode},
          'Degree': {show: Inspector.showIfNonFunGoal},
          'Operation': {show: Inspector.showIfFunGoal},
          'Object': {show: Inspector.showIfFunGoal},
          'NFR Type': {show: Inspector.showIfNonFunGoal},
          'Related Role': {
            show: function (node) {
              return node.Type !== undefined && node.Type.endsWith('性目标>>')
            },
            type: 'select',
            choices: function (node, propName) {
              return mySelf.projectRoles
            }
          }
        }
      })

    // Define the appearance and behavior for Nodes:
    // First, define the shared context menu for all Nodes, Links, and Groups.

    // To simplify this code we define a function for creating a context menu button:
    function makeButton (text, action, visiblePredicate) {
      return objGo('ContextMenuButton',
        objGo(go.TextBlock, text),
        { click: action },
        // don't bother with binding GraphObject.visible if there's no predicate
        visiblePredicate ? new go.Binding('visible', '', function (o, e) { return o.diagram ? visiblePredicate(o, e) : false }).ofObject() : {})
    }

    // a context menu is an Adornment with a bunch of buttons in them
    var myContextMenu =
        objGo('ContextMenu',
          makeButton('Cut',
            function (e, obj) { e.diagram.commandHandler.cutSelection() },
            function (o) { return o.diagram.commandHandler.canCutSelection() }),
          makeButton('Copy',
            function (e, obj) { e.diagram.commandHandler.copySelection() },
            function (o) { return o.diagram.commandHandler.canCopySelection() }),
          makeButton('Paste',
            function (e, obj) { e.diagram.commandHandler.pasteSelection(e.diagram.lastInput.documentPoint) },
            function (o) { return o.diagram.commandHandler.canPasteSelection() }),
          makeButton('Delete',
            function (e, obj) { e.diagram.commandHandler.deleteSelection() },
            function (o) { return o.diagram.commandHandler.canDeleteSelection() }),
          makeButton('Undo',
            function (e, obj) { e.diagram.commandHandler.undo() },
            function (o) { return o.diagram.commandHandler.canUndo() }),
          makeButton('Redo',
            function (e, obj) { e.diagram.commandHandler.redo() },
            function (o) { return o.diagram.commandHandler.canRedo() }),
          makeButton('Group',
            function (e, obj) { e.diagram.commandHandler.groupSelection() },
            function (o) { return o.diagram.commandHandler.canGroupSelection() }),
          makeButton('Ungroup',
            function (e, obj) { e.diagram.commandHandler.ungroupSelection() },
            function (o) { return o.diagram.commandHandler.canUngroupSelection() })
        )

    /* 模型鹰眼（总览） */
    objGo(go.Overview, 'diagramOverview', // the HTML DIV element for the Overview
      { observed: mySelf.myDiagram, contentAlignment: go.Spot.Center }) // tell it which Diagram to show and pan

    /* 将自定义的myContextMenu赋值为模型的右键菜单 */
    mySelf.myDiagram.contextMenu = myContextMenu
    var tooltiptemplateNode =
      objGo('ToolTip',
        objGo(go.TextBlock,
          {margin: 4},
          new go.Binding('text', 'Type')
        )
      )
    mySelf.myDiagram.nodeTemplate =
        objGo(go.Node, 'Auto', // 最底层Node
          {toolTip: tooltiptemplateNode},
          { contextMenu: myContextMenu },
          { locationSpot: go.Spot.Center },
          new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify),
          { selectable: true, selectionObjectName: 'PANEL', selectionAdornmentTemplate: nodeSelectionAdornmentTemplate, selectionChanged: onSelectionChanged },
          { rotatable: true, rotateObjectName: 'MAINPANEL', rotateAdornmentTemplate: nodeRotateAdornmentTemplate },
          { resizable: true, resizeObjectName: 'PANEL', resizeAdornmentTemplate: nodeResizeAdornmentTemplate },
          new go.Binding('angle').makeTwoWay(),
          objGo(go.Panel, 'Vertical', // Vertical属性值定义内部元素垂直排列，包含用以定义Spot的面板和Type文本框
            {name: 'MAINPANEL'},
            objGo(go.Panel, 'Spot', // Spot属性值定义元素四边Spot
              objGo(go.Panel, 'Auto', // Auto属性值定义自适应包含内部元素，包含shape和用户可编辑文本框
                {name: 'PANEL'},
                new go.Binding('desiredSize', 'size', go.Size.parse).makeTwoWay(go.Size.stringify),
                objGo(go.Shape, 'Rectangle', // shape
                  {name: 'SHAPE'},
                  {portId: '', fromLinkable: true, toLinkable: true, cursor: 'pointer'},
                  // {desiredSize: new go.Size(30, 30)},
                  // new go.Binding('desiredSize', 'size'),
                  new go.Binding('figure'),
                  new go.Binding('fill'),
                  new go.Binding('stroke'),
                  new go.Binding('strokeWidth'),
                  new go.Binding('strokeDashArray')
                ),
                objGo(go.TextBlock, // 用户可编辑文本框
                  {name: 'TEXTBLOCK'},
                  {margin: 1},
                  {minSize: new go.Size(30, 30),
                    // maxSize: new go.Size(80, NaN),
                    wrap: go.TextBlock.WrapFit,
                    editable: true,
                    isMultiline: true},
                  new go.Binding('minSize'),
                  new go.Binding('text', 'Name'),
                  new go.Binding('isUnderline'),
                  new go.Binding('isStrikethrough'),
                  new go.Binding('font'),
                  new go.Binding('textAlign')
                )
              ),
              makePort('T', go.Spot.Top, true, true),
              makePort('L', go.Spot.Left, true, true),
              makePort('R', go.Spot.Right, true, true),
              makePort('B', go.Spot.Bottom, true, true)
            )
            // objGo(go.TextBlock,
            //   {maxSize: new go.Size(160, NaN)},
            //   {font: 'bold 9pt Roboto,sans-serif', editable: false, wrap: go.TextBlock.WrapFit},
            //   new go.Binding('text', 'Type')
            // )
          ),

          { // handle mouse enter/leave events to show/hide the ports
            mouseEnter: function (e, node) { showSmallPorts(node, true) },
            mouseLeave: function (e, node) { showSmallPorts(node, false) }
          }
        )

    function showSmallPorts (node, show) {
      node.ports.each(function (port) {
        if (port.portId !== '') { // don't change the default port, which is the big shape
          port.fill = show ? 'rgba(0,0,0,.3)' : null
        }
      })
    }

    /* 网格定义 */
    var smallGrid = objGo(go.Panel, 'Grid',
      objGo(go.Shape, 'LineH', {stroke: 'lightgray', strokeWidth: 0.5}),
      objGo(go.Shape, 'LineH', {stroke: 'gray', strokeWidth: 0.5, interval: 3}),
      objGo(go.Shape, 'LineV', {stroke: 'lightgray', strokeWidth: 0.5}),
      objGo(go.Shape, 'LineV', {stroke: 'gray', strokeWidth: 0.5, interval: 3}))
    var normalGrid = objGo(go.Panel, 'Grid',
      objGo(go.Shape, 'LineH', {stroke: 'lightgray', strokeWidth: 0.5}),
      objGo(go.Shape, 'LineH', {stroke: 'gray', strokeWidth: 0.5, interval: 8}),
      objGo(go.Shape, 'LineV', {stroke: 'lightgray', strokeWidth: 0.5}),
      objGo(go.Shape, 'LineV', {stroke: 'gray', strokeWidth: 0.5, interval: 8}))
    var bigGrid = objGo(go.Panel, 'Grid',
      objGo(go.Shape, 'LineH', {stroke: 'lightgray', strokeWidth: 0.5}),
      objGo(go.Shape, 'LineH', {stroke: 'gray', strokeWidth: 0.5, interval: 14}),
      objGo(go.Shape, 'LineV', {stroke: 'lightgray', strokeWidth: 0.5}),
      objGo(go.Shape, 'LineV', {stroke: 'gray', strokeWidth: 0.5, interval: 14}))
    var biggerGrid = objGo(go.Panel, 'Grid',
      objGo(go.Shape, 'LineH', {stroke: 'lightgray', strokeWidth: 0.5}),
      objGo(go.Shape, 'LineH', {stroke: 'gray', strokeWidth: 0.5, interval: 22}),
      objGo(go.Shape, 'LineV', {stroke: 'lightgray', strokeWidth: 0.5}),
      objGo(go.Shape, 'LineV', {stroke: 'gray', strokeWidth: 0.5, interval: 22}))
    var myGrid = new Map()
    myGrid.set('small-size', smallGrid)
    myGrid.set('normal-size', normalGrid)
    myGrid.set('big-size', bigGrid)
    myGrid.set('bigger-size', biggerGrid)
    this.Grids = myGrid
    /* 链接模板定义 */
    const linkSelectionAdornmentTemplate =
        objGo(go.Adornment, 'Link',
          objGo(go.Shape,
            // isPanelMain declares that this Shape shares the Link.geometry
            { isPanelMain: true, fill: null, stroke: 'deepskyblue', strokeWidth: 0 }
          ) // use selection object's strokeWidth
        )

    mySelf.myDiagram.linkTemplate =
        objGo(go.Link, // the whole link panel
          {
            selectable: true,
            selectionAdornmentTemplate: linkSelectionAdornmentTemplate,
            relinkableFrom: true,
            relinkableTo: true,
            reshapable: true,
            curve: go.Link.JumpOver,
            corner: 5,
            toShortLength: 4,
            routing: go.Link.AvoidsNodes
          },
          new go.Binding('points').makeTwoWay(),
          objGo(go.Shape, // the link path shape
            {isPanelMain: true, strokeWidth: 2, fill: 'transparent', cursor: 'pointer'},

            new go.Binding('strokeWidth'),
            new go.Binding('strokeDashArray', 'strokeDashArray')
          ),
          objGo(go.Shape, // the from-arrowhead
            new go.Binding('fromArrow', 'fromArrow'),
            new go.Binding('fill', 'fromArrowFill'),
            {fromArrow: '', strokeWidth: 1}
          ),
          objGo(go.Shape, // the to-arrowhead
            new go.Binding('toArrow', 'toArrow'),
            new go.Binding('fill', 'toArrowFill'),
            { toArrow: 'SidewaysV', strokeWidth: 1 }
          ),
          objGo(go.Panel, 'Auto',
            {segmentIndex: 0},
            {segmentOffset: new go.Point(NaN, NaN),
              segmentOrientation: go.Link.OrientUpright},
            objGo(go.Shape, 'RoundedRectangle', // the link shape
              new go.Binding('visible', 'isSelected').ofObject(),
              { fill: '#eee', stroke: null }),
            objGo(go.TextBlock,
              {
                font: 'bold 9pt Roboto,sans-serif',
                stroke: '#000000',
                margin: 2,
                editable: true
              },
              new go.Binding('text', 'text1')
            )
          ),
          objGo(go.Panel, 'Auto',
            {segmentIndex: -1},
            {segmentOffset: new go.Point(NaN, NaN),
              segmentOrientation: go.Link.OrientUpright},
            objGo(go.Shape, 'RoundedRectangle', // the link shape
              new go.Binding('visible', 'isSelected').ofObject(),
              { fill: '#eee', stroke: null }),
            objGo(go.TextBlock,
              {
                font: 'bold 9pt Roboto,sans-serif',
                stroke: '#000000',
                margin: 2,
                editable: true
              },
              new go.Binding('text', 'text2')
            )
          ),
          {contextMenu: myContextMenu}
        )
    // Groups consist of a title in the color given by the group node data
    // above a translucent gray rectangle surrounding the member parts
    /* mySelf.myDiagram.groupTemplate =
      objGo(go.Group, 'Vertical',
        objGo(go.Panel, 'Auto',
          objGo(go.Shape, 'RoundedRectangle', // surrounds the Placeholder
            {name: 'SHAPE'},
            {portId: '', fromLinkable: true, toLinkable: true, cursor: 'pointer'},
            new go.Binding('figure'),
            new go.Binding('fill'),
            new go.Binding('stroke'),
            new go.Binding('strokeWidth'),
            new go.Binding('strokeDashArray')),
          objGo(go.Placeholder, // represents the area of all member parts,
            { padding: 5
            }) // with some extra padding around them
        ),
        objGo(go.TextBlock, // 用户可编辑文本框
          {name: 'TEXTBLOCK'},
          {margin: 10},
          {minSize: new go.Size(30, 30),
            maxSize: new go.Size(160, NaN),
            wrap: go.TextBlock.WrapFit,
            editable: false,
            isMultiline: true},
          new go.Binding('minSize'),
          new go.Binding('text', 'Name'),
          new go.Binding('isUnderline'),
          new go.Binding('isStrikethrough'),
          new go.Binding('font'),
          new go.Binding('textAlign')
        )
      ) */
    mySelf.myDiagram.groupTemplate =
        objGo(go.Group, 'Vertical',
          {contextMenu: myContextMenu},
          {selectionObjectName: 'PANEL', ungroupable: true},
          {selectionChanged: onSelectionChanged},
          objGo(go.TextBlock,
            {name: 'TEXTBLOCK'},
            {font: '10pt Times New Roman', isMultiline: false, editable: false, text: ''},
            new go.Binding('text', 'Name'),
            new go.Binding('font'),
            new go.Binding('isUnderline'),
            new go.Binding('isStrikethrough'),
            new go.Binding('textAlign')
          ),

          objGo(go.Panel, 'Auto',
            {name: 'PANEL', cursor: 'pointer'},
            objGo(go.Shape, 'RoundedRectangle', // surrounds the Placeholder
              {name: 'SHAPE'},
              {stroke: '#000000', strokeDashArray: null, strokeWidth: 2, portId: '', fromLinkable: true, toLinkable: true, cursor: 'pointer', fill: 'transparent'},
              new go.Binding('figure'),
              // objGo(go.Shape, 'Rectangle',
              // {name: 'SHAPE'},
              // { stroke: '#000000', strokeDashArray: null, strokeWidth: 2, portId: '', cursor: 'pointer', fromLinkable: true, toLinkable: true, fill: 'transparent' },
              new go.Binding('fill'),
              new go.Binding('stroke'),
              new go.Binding('strokeWidth'),
              new go.Binding('strokeDashArray')
            ),
            objGo(go.Placeholder,
              {margin: 10, background: 'transparent'}
            )
          )
        )
    // this function is used to highlight a Group that the selection may be dropped into
    function highlightGroup (e, grp, show) {
      if (!grp) return
      e.handled = true
      if (show) {
        // cannot depend on the grp.diagram.selection in the case of external drag-and-drops;
        // instead depend on the DraggingTool.draggedParts or .copiedParts
        var tool = grp.diagram.toolManager.draggingTool
        var map = tool.draggedParts || tool.copiedParts // this is a Map
        // now we can check to see if the Group will accept membership of the dragged Parts
        if (grp.canAddMembers(map.toKeySet())) {
          grp.isHighlighted = true
          return
        }
      }
      grp.isHighlighted = false
    }

    // Upon a drop onto a Group, we try to add the selection as members of the Group.
    // Upon a drop onto the background, or onto a top-level Node, make selection top-level.
    // If this is OK, we're done; otherwise we cancel the operation to rollback everything.
    function finishDrop (e, grp) {
      var ok = (grp !== null
        ? grp.addMembers(grp.diagram.selection, true)
        : e.diagram.commandHandler.addTopLevelParts(e.diagram.selection, true))
      if (!ok) e.diagram.currentTool.doCancel()
    }
    mySelf.myDiagram.groupTemplateMap.add('OfNodes',
      objGo(go.Group, 'Auto',
        {toolTip: tooltiptemplateNode},
        {contextMenu: myContextMenu},
        {
          background: 'transparent',
          ungroupable: true,
          // highlight when dragging into the Group
          mouseDragEnter: function (e, grp, prev) { highlightGroup(e, grp, true) },
          mouseDragLeave: function (e, grp, next) { highlightGroup(e, grp, false) },
          computesBoundsAfterDrag: true,
          // when the selection is dropped into a Group, add the selected Parts into that Group;
          // if it fails, cancel the tool, rolling back any changes
          mouseDrop: finishDrop,
          handlesDragDropForMembers: true // don't need to define handlers on member Nodes and Links
          // Groups containing Nodes lay out their members vertically
          // layout:
          //   objGo(go.GridLayout,
          //     {
          //       wrappingColumn: 1,
          //       alignment: go.GridLayout.Position,
          //       cellSize: new go.Size(1, 1),
          //       spacing: new go.Size(4, 4)
          //     })
        },
        new go.Binding('background', 'isHighlighted', function (h) { return h ? 'rgba(255,0,0,0.2)' : 'transparent' }).ofObject(),
        objGo(go.Shape, 'RoundedRectangle',
          {name: 'SHAPE'},
          {stroke: '#33D3E5', strokeDashArray: null, strokeWidth: 2, portId: '', fromLinkable: true, toLinkable: true, cursor: 'pointer', fill: 'transparent'},
          new go.Binding('figure'),
          // new go.Binding('fill'),
          new go.Binding('stroke'),
          new go.Binding('strokeWidth'),
          new go.Binding('strokeDashArray')),
        // { fill: null, stroke: '#000000', strokeWidth: 2 }),
        objGo(go.Panel, 'Vertical', // title above Placeholder
          objGo(go.Panel, 'Horizontal', // button next to TextBlock
            { stretch: go.GraphObject.Horizontal, background: null },
            objGo('SubGraphExpanderButton',
              { alignment: go.Spot.Right, margin: 5 }),
            objGo(go.Shape, 'Actor',
              { fill: '#eac49e', stroke: '#CDAA7D', width: 15, height: 20, alignment: go.Spot.Right, margin: 5 }),
            objGo(go.TextBlock,
              {name: 'TEXTBLOCK'},
              {
                alignment: go.Spot.Left,
                editable: false,
                isMultiline: false,
                margin: 5,
                font: '10pt Times New Roman',
                text: ''
              },
              new go.Binding('text', 'Name'),
              new go.Binding('font'),
              new go.Binding('isUnderline'),
              new go.Binding('isStrikethrough'),
              new go.Binding('textAlign'))
          ), // end Horizontal Panel
          objGo(go.Placeholder,
            { margin: 10, background: 'transparent' })
          // objGo(go.TextBlock,
          //   {maxSize: new go.Size(160, NaN)},
          //   {font: 'bold 9pt Roboto,sans-serif', editable: false, wrap: go.TextBlock.WrapFit},
          //   new go.Binding('text', 'Type')
          // )
        ) // end Vertical Panel

      ))// end Group and call to add to template Map
    mySelf.myDiagram.addModelChangedListener(function (evt) {
      if (evt.isTransactionFinished) {
        mySelf.save()
      }
    })

    // check link(两节点之间若能存在某种关系则对应连线有且仅有一)
    function checkLink (fn, fp, tn, tp, link) {
      let ie
      if (!fn || !tn) {
        return true
      }
      ie = fn.findLinksBetween(tn).all(
        function (l) {
          if (l.data.Linktype === link.data.Linktype && l.data.to === tn.data.key && l.data.from === fn.data.key && l.data.__gohashid !== link.data.__gohashid) {
            return false
          }
          return true
        }
      )
      return ie
    }

    var tooltiptemplate =
        objGo('ToolTip',
          objGo(go.TextBlock,
            {margin: 4},
            new go.Binding('text', 'Linktype')
          )
        )
    // var tooltiptemplateNode =
    //   objGo('ToolTip',
    //     objGo(go.TextBlock,
    //       {margin: 4},
    //       new go.Binding('text', 'Type')
    //     )
    //   )
    objGo(go.Palette, 'myPaletteDiv3',
      { maxSelectionCount: 1,
        nodeTemplateMap: this.myDiagram.nodeTemplateMap,
        model: new go.GraphLinksModel([ // specify the contents of the Palette
          // { figure: "Rectangle", Name:"",minSize:new go.Size(20,20),fill:"#ffffff",stroke:"#000000",strokeWidth:2,font:"10pt Times New Roman",isUnderline:false,isStrikethrough:false,textAlign:"center",strokeDashArray:null },
          { figure: 'RoundedRectangle', Name: '', minSize: new go.Size(20, 20), fill: '#ffffff', stroke: '#000000', strokeWidth: 2, font: '10pt Times New Roman', isUnderline: false, isStrikethrough: false, textAlign: 'center', strokeDashArray: null },
          // { figure: "Square", Name:"",minSize:new go.Size(20,20),fill:"#ffffff",stroke:"#000000",strokeWidth:2,font:"10pt Times New Roman",isUnderline:false,isStrikethrough:false,textAlign:"center",strokeDashArray:null},
          { figure: 'Ellipse', Name: '', minSize: new go.Size(20, 20), fill: '#ffffff', stroke: '#000000', strokeWidth: 2, font: '10pt Times New Roman', isUnderline: false, isStrikethrough: false, textAlign: 'center', strokeDashArray: null },
          { figure: 'Circle', Name: '', minSize: new go.Size(20, 20), fill: '#ffffff', stroke: '#000000', strokeWidth: 2, font: '10pt Times New Roman', isUnderline: false, isStrikethrough: false, textAlign: 'center', strokeDashArray: null },
          { figure: 'Pentagon', Name: '', minSize: new go.Size(20, 20), fill: '#ffffff', stroke: '#000000', strokeWidth: 2, font: '10pt Times New Roman', isUnderline: false, isStrikethrough: false, textAlign: 'center', strokeDashArray: null },
          { figure: 'Hexagon', Name: '', minSize: new go.Size(20, 20), fill: '#ffffff', stroke: '#000000', strokeWidth: 2, font: '10pt Times New Roman', isUnderline: false, isStrikethrough: false, textAlign: 'center', strokeDashArray: null },
          { figure: 'Heptagon', Name: '', minSize: new go.Size(20, 20), fill: '#ffffff', stroke: '#000000', strokeWidth: 2, font: '10pt Times New Roman', isUnderline: false, isStrikethrough: false, textAlign: 'center', strokeDashArray: null },
          { figure: 'Nonagon', Name: '', minSize: new go.Size(20, 20), fill: '#ffffff', stroke: '#000000', strokeWidth: 2, font: '10pt Times New Roman', isUnderline: false, isStrikethrough: false, textAlign: 'center', strokeDashArray: null },
          { figure: 'Decagon', Name: '', minSize: new go.Size(20, 20), fill: '#ffffff', stroke: '#000000', strokeWidth: 2, font: '10pt Times New Roman', isUnderline: false, isStrikethrough: false, textAlign: 'center', strokeDashArray: null },
          { figure: 'Cylinder1', Name: '', minSize: new go.Size(20, 20), fill: '#ffffff', stroke: '#000000', strokeWidth: 2, font: '10pt Times New Roman', isUnderline: false, isStrikethrough: false, textAlign: 'center', strokeDashArray: null },
          { figure: 'Parallelogram1', Name: '', minSize: new go.Size(20, 20), fill: '#ffffff', stroke: '#000000', strokeWidth: 2, font: '10pt Times New Roman', isUnderline: false, isStrikethrough: false, textAlign: 'center', strokeDashArray: null },
          { figure: 'Trapezoid', Name: '', minSize: new go.Size(20, 20), fill: '#ffffff', stroke: '#000000', strokeWidth: 2, font: '10pt Times New Roman', isUnderline: false, isStrikethrough: false, textAlign: 'center', strokeDashArray: null },
          { figure: 'Cube2', Name: '', minSize: new go.Size(20, 20), fill: '#ffffff', stroke: '#000000', strokeWidth: 2, font: '10pt Times New Roman', isUnderline: false, isStrikethrough: false, textAlign: 'center', strokeDashArray: null },
          { figure: 'File', Name: '', minSize: new go.Size(20, 20), fill: '#ffffff', stroke: '#000000', strokeWidth: 2, font: '10pt Times New Roman', isUnderline: false, isStrikethrough: false, textAlign: 'center', strokeDashArray: null },
          { figure: 'Card', Name: '', minSize: new go.Size(20, 20), fill: '#ffffff', stroke: '#000000', strokeWidth: 2, font: '10pt Times New Roman', isUnderline: false, isStrikethrough: false, textAlign: 'center', strokeDashArray: null },
          { figure: 'LoopLimit', Name: '', minSize: new go.Size(20, 20), fill: '#ffffff', stroke: '#000000', strokeWidth: 2, font: '10pt Times New Roman', isUnderline: false, isStrikethrough: false, textAlign: 'center', strokeDashArray: null },
          { figure: 'Decision', Name: '', minSize: new go.Size(20, 20), fill: '#ffffff', stroke: '#000000', strokeWidth: 2, font: '10pt Times New Roman', isUnderline: false, isStrikethrough: false, textAlign: 'center', strokeDashArray: null },
          // { figure: "Triangle", Name:"",minSize:new go.Size(20,20),fill:"#ffffff",stroke:"#000000",strokeWidth:2,font:"10pt Times New Roman",isUnderline:false,isStrikethrough:false,textAlign:"center",strokeDashArray:null },
          // { figure: "RightTriangle", Name:"",minSize:new go.Size(20,20),fill:"#ffffff",stroke:"#000000",strokeWidth:2,font:"10pt Times New Roman",isUnderline:false,isStrikethrough:false,textAlign:"center",strokeDashArray:null },
          { figure: 'Junction', Name: '', minSize: new go.Size(20, 20), fill: '#ffffff', stroke: '#000000', strokeWidth: 2, font: '10pt Times New Roman', isUnderline: false, isStrikethrough: false, textAlign: 'center', strokeDashArray: null },
          { figure: 'Or', Name: '', minSize: new go.Size(20, 20), fill: '#ffffff', stroke: '#000000', strokeWidth: 2, font: '10pt Times New Roman', isUnderline: false, isStrikethrough: false, textAlign: 'center', strokeDashArray: null },
          { figure: 'BpmnActivityLoop', Name: '', minSize: new go.Size(20, 20), fill: '#ffffff', stroke: '#000000', strokeWidth: 2, font: '10pt Times New Roman', isUnderline: false, isStrikethrough: false, textAlign: 'center', strokeDashArray: null },
          { figure: 'SquareArrow', Name: '', fill: '#ffffff', stroke: '#000000', strokeWidth: 2, font: '10pt Times New Roman', isUnderline: false, isStrikethrough: false, textAlign: 'center', strokeDashArray: null },
          { figure: 'DoubleArrow', Name: '', fill: '#ffffff', stroke: '#000000', strokeWidth: 2, font: '10pt Times New Roman', isUnderline: false, isStrikethrough: false, textAlign: 'center', strokeDashArray: null },
          { figure: 'ThinCross', Name: '', fill: '#ffffff', stroke: '#000000', strokeWidth: 2, font: '10pt Times New Roman', isUnderline: false, isStrikethrough: false, textAlign: 'center', strokeDashArray: null },
          // { figure: "NandGate",Name:"",minSize:new go.Size(20,20),fill:"#ffffff",stroke:"#000000",strokeWidth:2,font:"10pt Times New Roman",isUnderline:false,isStrikethrough:false,textAlign:"center",strokeDashArray:null },
          // { figure: "Inverter", Name:"",minSize:new go.Size(20,20),fill:"#ffffff",stroke:"#000000",strokeWidth:2,font:"10pt Times New Roman",isUnderline:false,isStrikethrough:false,textAlign:"center",strokeDashArray:null },
          // { figure: "NorGate", Name:"",minSize:new go.Size(20,20),fill:"#ffffff",stroke:"#000000",strokeWidth:2,font:"10pt Times New Roman",isUnderline:false,isStrikethrough:false,textAlign:"center",strokeDashArray:null },
          // { figure: "OrGate", Name:"",minSize:new go.Size(20,20),fill:"#ffffff",stroke:"#000000",strokeWidth:2,font:"10pt Times New Roman",isUnderline:false,isStrikethrough:false,textAlign:"center",strokeDashArray:null },
          // { figure: "XnorGate", Name:"",minSize:new go.Size(20,20),fill:"#ffffff",stroke:"#000000",strokeWidth:2,font:"10pt Times New Roman",isUnderline:false,isStrikethrough:false,textAlign:"center",strokeDashArray:null },
          // { figure: "XorGate", Name:"",minSize:new go.Size(20,20),fill:"#ffffff",stroke:"#000000",strokeWidth:2,font:"10pt Times New Roman",isUnderline:false,isStrikethrough:false,textAlign:"center",strokeDashArray:null },
          // { figure: "Arrow", Name:"",minSize:new go.Size(20,20),fill:"#ffffff",stroke:"#000000",strokeWidth:2,font:"10pt Times New Roman",isUnderline:false,isStrikethrough:false,textAlign:"center",strokeDashArray:null },
          // { figure: "DoubleEndArrow", Name:"",minSize:new go.Size(20,20),fill:"#ffffff",stroke:"#000000",strokeWidth:2,font:"10pt Times New Roman",isUnderline:false,isStrikethrough:false,textAlign:"center",strokeDashArray:null },
          // { figure: "IBeamArrow", Name:"",minSize:new go.Size(20,20),fill:"#ffffff",stroke:"#000000",strokeWidth:2,font:"10pt Times New Roman",isUnderline:false,isStrikethrough:false,textAlign:"center",strokeDashArray:null },
          // { figure: "SplitEndArrow", Name:"",minSize:new go.Size(20,20),fill:"#ffffff",stroke:"#000000",strokeWidth:2,font:"10pt Times New Roman",isUnderline:false,isStrikethrough:false,textAlign:"center",strokeDashArray:null },
          { figure: 'Actor', Name: '', minSize: new go.Size(20, 20), fill: '#ffffff', stroke: '#000000', strokeWidth: 2, font: '10pt Times New Roman', isUnderline: false, isStrikethrough: false, textAlign: 'center', strokeDashArray: null }

        ])
      }
    )

    objGo(go.Palette, 'myPaletteDiv4',
      { maxSelectionCount: 1,
        linkTemplate:
            objGo(go.Link,
              {toolTip: tooltiptemplate},
              { locationSpot: go.Spot.Center,
                selectionAdorned: false,
                curve: go.Link.JumpOver,
                corner: 5,
                toShortLength: 4,
                routing: go.Link.AvoidsNodes
              },
              new go.Binding('points'),
              objGo(go.Shape, // the link path shape
                {isPanelMain: true, strokeWidth: 2, cursor: 'pointer'},
                new go.Binding('strokeDashArray', 'strokeDashArray')
              ),
              objGo(go.Shape, // the to-arrowhead
                new go.Binding('fromArrow', 'fromArrow'),
                {fromArrow: '', strokeWidth: 1},
                new go.Binding('fill', 'fromArrowFill')
              ),
              objGo(go.Shape, // the to-arrowhead
                new go.Binding('toArrow', 'toArrow'),
                {toArrow: '', strokeWidth: 1},
                new go.Binding('fill', 'toArrowFill')
              )
            ),
        model: new go.GraphLinksModel( // specify the contents of the Palette
          [],
          [
            {points: new go.List(go.Point).addAll([new go.Point(0, 0), new go.Point(50, 50)]), toArrow: 'SidewaysV', Linktype: '依赖'},
            {points: new go.List(go.Point).addAll([new go.Point(0, 0), new go.Point(50, 50)]), toArrow: 'Triangle', Linktype: '关联目标'},
            {points: new go.List(go.Point).addAll([new go.Point(0, 0), new go.Point(50, 50)]), toArrow: 'Triangle', toArrowFill: 'Transparent', Linktype: '关联功能目标'},
            {points: new go.List(go.Point).addAll([new go.Point(0, 0), new go.Point(50, 50)]), toArrow: 'StretchedDiamond', toArrowFill: 'Transparent', Linktype: '聚合'},
            {points: new go.List(go.Point).addAll([new go.Point(0, 0), new go.Point(50, 50)]), toArrow: 'StretchedDiamond', Linktype: '组合'},
            {points: new go.List(go.Point).addAll([new go.Point(0, 0), new go.Point(50, 50)]), toArrow: 'Circle', toArrowFill: 'Transparent', fromArrow: 'Circle', Linktype: '多选一'},
            {points: new go.List(go.Point).addAll([new go.Point(0, 0), new go.Point(50, 50)]), toArrow: 'Fork', Linktype: '互斥'},
            {points: new go.List(go.Point).addAll([new go.Point(0, 0), new go.Point(50, 50)]), toArrow: 'Circle', toArrowFill: 'Transparent', Linktype: '可选'},
            {points: new go.List(go.Point).addAll([new go.Point(0, 0), new go.Point(50, 50)]), toArrow: 'Circle', Linktype: '必选'},
            {points: new go.List(go.Point).addAll([new go.Point(0, 0), new go.Point(50, 50)]), toArrow: '', Linktype: '多选多'},
            {points: new go.List(go.Point).addAll([new go.Point(0, 0), new go.Point(50, 50)]), toArrow: 'DoubleFeathers', Linktype: '促进'}
            // //折线
            // {points: new go.List(go.Point).addAll([new go.Point(0, 0),new go.Point(10, 0), new go.Point(10, 20),new go.Point(50, 50)]),toArrow:"SidewaysV",Linktype:"依赖"},
            // {points: new go.List(go.Point).addAll([new go.Point(0, 0),new go.Point(10, 0), new go.Point(10, 20),new go.Point(50, 50)]),toArrow:"Triangle",Linktype:"关联目标"},
            // {points: new go.List(go.Point).addAll([new go.Point(0, 0),new go.Point(10, 0), new go.Point(10, 20),new go.Point(50, 50)]),toArrow:"Triangle",toArrowFill:"Transparent",Linktype:"关联功能目标"},
            // {points: new go.List(go.Point).addAll([new go.Point(0, 0),new go.Point(10, 0), new go.Point(10, 20),new go.Point(50, 50)]),toArrow:"StretchedDiamond",toArrowFill:"Transparent",Linktype:"聚合"},
            // {points: new go.List(go.Point).addAll([new go.Point(0, 0),new go.Point(10, 0), new go.Point(10, 20),new go.Point(50, 50)]),toArrow:"StretchedDiamond",Linktype:"组合"},
            // {points: new go.List(go.Point).addAll([new go.Point(0, 0),new go.Point(10, 0), new go.Point(10, 20),new go.Point(50, 50)]),toArrow:"Circle",toArrowFill:"Transparent",fromArrow:"Circle",Linktype:"多选一"},
            // {points: new go.List(go.Point).addAll([new go.Point(0, 0),new go.Point(10, 0), new go.Point(10, 20),new go.Point(50, 50)]),toArrow:"Fork",Linktype:"互斥"},
            // {points: new go.List(go.Point).addAll([new go.Point(0, 0),new go.Point(10, 0), new go.Point(10, 20),new go.Point(50, 50)]),toArrow:"Circle",toArrowFill:"Transparent",Linktype:"可选"},
            // {points: new go.List(go.Point).addAll([new go.Point(0, 0),new go.Point(10, 0), new go.Point(10, 20),new go.Point(50, 50)]),toArrow:"Circle",Linktype:"必选"},
            // {points: new go.List(go.Point).addAll([new go.Point(0, 0),new go.Point(10, 0), new go.Point(10, 20),new go.Point(50, 50)]),toArrow:"",Linktype:"多选多"},
            // {points: new go.List(go.Point).addAll([new go.Point(0, 0),new go.Point(10, 0), new go.Point(10, 20),new go.Point(50, 50)]),toArrow:"DoubleFeathers",Linktype:"促进"}
          ])
      }
    )

    function onSelectionChanged (item) {
      let shape = item.findObject('SHAPE')
      let textBlock = item.findObject('TEXTBLOCK')
      let pattern = /(\d+pt)\s(.*)$/
      let results = textBlock.font.match(pattern)
      mySelf.isBold = textBlock.font.search('bold') !== -1
      mySelf.selectedSize = results[1]
      mySelf.selectedFont = results[2]
      mySelf.isCrossover = (shape.strokeWidth === 5).toString()
      if (shape.strokeDashArray !== null) {
        if (shape.strokeDashArray[0] === 8) {
          mySelf.strokeStyle = 'dashed'
        } else if (shape.strokeDashArray[0] === 2) { mySelf.strokeStyle = 'dotted' }
      } else mySelf.strokeStyle = 'solid'
    }
  },
  watch: {
    listenChangemixed: {
      handler: function (newval, oldval) {
        // this.isMixed = true
      }},
    /* grid change */
    flag_showgrid: function (oldSelect, newSelect) {
      if (!this.flag_showgrid || ((typeof this.selectGrid !== 'undefined') && this.selectGrid !== 0 && !this.selectGrid)) {
        this.myDiagram.grid = objGo(go.Panel, 'Grid')
      } else {
        this.myDiagram.grid = this.Grids.get(this.selectGrid)
      }
    },
    selectGrid: function (oldSelect, newSelect) {
      if (!this.flag_showgrid || ((typeof this.selectGrid !== 'undefined') && this.selectGrid !== 0 && !this.selectGrid)) {
        this.myDiagram.grid = objGo(go.Panel, 'Grid')
      } else {
        this.myDiagram.grid = this.Grids.get(this.selectGrid)
      }
    },
    diagram: function (n, o) {
      this.load(n.jsonContent)
      this.moveCanvasCenter()
      let tooltiptemplate =
          objGo('ToolTip',
            objGo(go.TextBlock,
              {margin: 4},
              new go.Binding('text', 'Linktype')
            )
          )
      switch (this.diagram.diagramType) {
        case 'VN': {
          if (this.$i18n.locale === 'zh') {
            go.GraphObject.make(go.Palette, 'myPaletteDiv1', // must name or refer to the DIV HTML element
              { maxSelectionCount: 1,
                nodeTemplateMap: this.myDiagram.nodeTemplateMap, // share the templates used by myDiagram
                model: new go.GraphLinksModel([ // specify the contents of the Palette
                  // {Name: '', Type: '<<价值活动>>', Annotation: '', figure: 'Card', nodeType: 'serviceValue', fill: '#fad7a7', stroke: '#000000', strokeWidth: 2, font: '10pt Times New Roman', isUnderline: false, isStrikethrough: false, textAlign: 'center', strokeDashArray: null},
                  // {Name: '', Type: '<<价值对象>>', Annotation: '', figure: 'RoundedRectangle', nodeType: 'serviceValue', fill: '#f4e4d0', stroke: '#000000', strokeWidth: 2, font: '10pt Times New Roman', isUnderline: false, isStrikethrough: false, textAlign: 'center', strokeDashArray: null},
                  // {Name: '', Type: '<<资源>>', Annotation: '', figure: 'ExternalOrganization', nodeType: 'serviceValue', fill: '#f4d9ce', stroke: '#000000', strokeWidth: 2, font: '10pt Times New Roman', isUnderline: false, isStrikethrough: false, textAlign: 'center', strokeDashArray: null},
                  // {Name: '', Type: '<<服务>>', Annotation: '', figure: 'InternalStorage', nodeType: 'serviceValue', fill: '#e2c0c1', stroke: '#000000', strokeWidth: 2, font: '10pt Times New Roman', isUnderline: false, isStrikethrough: false, textAlign: 'center', strokeDashArray: null},
                  // {Name: '', Type: '<<目标>>', Annotation: '', figure: 'Ellipse', nodeType: 'serviceValue', fill: '#b0cdb9', stroke: '#000000', strokeWidth: 2, font: '10pt Times New Roman', isUnderline: false, isStrikethrough: false, textAlign: 'center', strokeDashArray: null},
                  // {Name: '', Type: '<<角色>>', Annotation: '', figure: 'Actor', minSize: new go.Size(20, 20), width: 50, height: 70, nodeType: 'serviceValue', fill: '#eac49e', stroke: '#000000', strokeWidth: 2, font: '10pt Times New Roman', isUnderline: false, isStrikethrough: false, textAlign: 'center', strokeDashArray: null}

                  {Name: '', Type: '<<价值活动>>', Annotation: '', figure: 'Card', nodeType: 'serviceValue', fill: '#fad7a7', stroke: '#DAA520', strokeWidth: 2, font: '10pt Times New Roman', isUnderline: false, isStrikethrough: false, textAlign: 'center', strokeDashArray: null},
                  {Name: '', Type: '<<价值对象>>', Annotation: '', figure: 'RoundedRectangle', nodeType: 'serviceValue', fill: '#f4e4d0', stroke: '#CDAA7D', strokeWidth: 2, font: '10pt Times New Roman', isUnderline: false, isStrikethrough: false, textAlign: 'center', strokeDashArray: null},
                  {Name: '', Type: '<<资源>>', Annotation: '', figure: 'ExternalOrganization', nodeType: 'serviceValue', fill: '#f4d9ce', stroke: '#CDB7B5', strokeWidth: 2, font: '10pt Times New Roman', isUnderline: false, isStrikethrough: false, textAlign: 'center', strokeDashArray: null},
                  {Name: '', Type: '<<服务>>', Annotation: '', figure: 'InternalStorage', nodeType: 'serviceValue', fill: '#e2c0c1', stroke: '#BC8F8F', strokeWidth: 2, font: '10pt Times New Roman', isUnderline: false, isStrikethrough: false, textAlign: 'center', strokeDashArray: null},
                  {Name: '', Type: '<<目标>>', Annotation: '', figure: 'Ellipse', nodeType: 'serviceValue', fill: '#b0cdb9', stroke: '#2E8B57', strokeWidth: 2, font: '10pt Times New Roman', isUnderline: false, isStrikethrough: false, textAlign: 'center', strokeDashArray: null},
                  {Name: '', Type: '<<角色>>', Annotation: '', figure: 'Actor', minSize: new go.Size(20, 20), width: 50, height: 70, nodeType: 'serviceValue', fill: '#eac49e', stroke: '#CDAA7D', strokeWidth: 2, font: '10pt Times New Roman', isUnderline: false, isStrikethrough: false, textAlign: 'center', strokeDashArray: null}

                ])
              }
            )
          } else {
            go.GraphObject.make(go.Palette, 'myPaletteDiv1', // must name or refer to the DIV HTML element
              { maxSelectionCount: 1,
                nodeTemplateMap: this.myDiagram.nodeTemplateMap, // share the templates used by myDiagram
                model: new go.GraphLinksModel([ // specify the contents of the Palette
                  // 英文版本
                  {Name: '', Type: '<<Value activity>>', Annotation: '', figure: 'Card', nodeType: 'serviceValue', fill: '#fad7a7', stroke: '#DAA520', strokeWidth: 2, font: '10pt Times New Roman', isUnderline: false, isStrikethrough: false, textAlign: 'center', strokeDashArray: null},
                  {Name: '', Type: '<<Value object>>', Annotation: '', figure: 'RoundedRectangle', nodeType: 'serviceValue', fill: '#f4e4d0', stroke: '#CDAA7D', strokeWidth: 2, font: '10pt Times New Roman', isUnderline: false, isStrikethrough: false, textAlign: 'center', strokeDashArray: null},
                  {Name: '', Type: '<<Resource>>', Annotation: '', figure: 'ExternalOrganization', nodeType: 'serviceValue', fill: '#f4d9ce', stroke: '#CDB7B5', strokeWidth: 2, font: '10pt Times New Roman', isUnderline: false, isStrikethrough: false, textAlign: 'center', strokeDashArray: null},
                  {Name: '', Type: '<<Service>>', Annotation: '', figure: 'InternalStorage', nodeType: 'serviceValue', fill: '#e2c0c1', stroke: '#BC8F8F', strokeWidth: 2, font: '10pt Times New Roman', isUnderline: false, isStrikethrough: false, textAlign: 'center', strokeDashArray: null},
                  {Name: '', Type: '<<Goal>>', Annotation: '', figure: 'Ellipse', nodeType: 'serviceValue', fill: '#b0cdb9', stroke: '#2E8B57', strokeWidth: 2, font: '10pt Times New Roman', isUnderline: false, isStrikethrough: false, textAlign: 'center', strokeDashArray: null},
                  {Name: '', Type: '<<Role>>', Annotation: '', figure: 'Actor', minSize: new go.Size(20, 20), width: 50, height: 70, nodeType: 'serviceValue', fill: '#eac49e', stroke: '#CDAA7D', strokeWidth: 2, font: '10pt Times New Roman', isUnderline: false, isStrikethrough: false, textAlign: 'center', strokeDashArray: null}

                ])
              }
            )
          }
          go.GraphObject.make(go.Palette, 'myPaletteDiv1', // must name or refer to the DIV HTML element
            { maxSelectionCount: 1,
              nodeTemplateMap: this.myDiagram.nodeTemplateMap, // share the templates used by myDiagram
              model: new go.GraphLinksModel([ // specify the contents of the Palette
                // {Name: '', Type: '<<价值活动>>', Annotation: '', figure: 'Card', nodeType: 'serviceValue', fill: '#fad7a7', stroke: '#000000', strokeWidth: 2, font: '10pt Times New Roman', isUnderline: false, isStrikethrough: false, textAlign: 'center', strokeDashArray: null},
                // {Name: '', Type: '<<价值对象>>', Annotation: '', figure: 'RoundedRectangle', nodeType: 'serviceValue', fill: '#f4e4d0', stroke: '#000000', strokeWidth: 2, font: '10pt Times New Roman', isUnderline: false, isStrikethrough: false, textAlign: 'center', strokeDashArray: null},
                // {Name: '', Type: '<<资源>>', Annotation: '', figure: 'ExternalOrganization', nodeType: 'serviceValue', fill: '#f4d9ce', stroke: '#000000', strokeWidth: 2, font: '10pt Times New Roman', isUnderline: false, isStrikethrough: false, textAlign: 'center', strokeDashArray: null},
                // {Name: '', Type: '<<服务>>', Annotation: '', figure: 'InternalStorage', nodeType: 'serviceValue', fill: '#e2c0c1', stroke: '#000000', strokeWidth: 2, font: '10pt Times New Roman', isUnderline: false, isStrikethrough: false, textAlign: 'center', strokeDashArray: null},
                // {Name: '', Type: '<<目标>>', Annotation: '', figure: 'Ellipse', nodeType: 'serviceValue', fill: '#b0cdb9', stroke: '#000000', strokeWidth: 2, font: '10pt Times New Roman', isUnderline: false, isStrikethrough: false, textAlign: 'center', strokeDashArray: null},
                // {Name: '', Type: '<<角色>>', Annotation: '', figure: 'Actor', minSize: new go.Size(20, 20), width: 50, height: 70, nodeType: 'serviceValue', fill: '#eac49e', stroke: '#000000', strokeWidth: 2, font: '10pt Times New Roman', isUnderline: false, isStrikethrough: false, textAlign: 'center', strokeDashArray: null}

                {Name: '', Type: '<<价值活动>>', Annotation: '', figure: 'Card', nodeType: 'serviceValue', fill: '#fad7a7', stroke: '#DAA520', strokeWidth: 2, font: '10pt Times New Roman', isUnderline: false, isStrikethrough: false, textAlign: 'center', strokeDashArray: null},
                {Name: '', Type: '<<价值对象>>', Annotation: '', figure: 'RoundedRectangle', nodeType: 'serviceValue', fill: '#f4e4d0', stroke: '#CDAA7D', strokeWidth: 2, font: '10pt Times New Roman', isUnderline: false, isStrikethrough: false, textAlign: 'center', strokeDashArray: null},
                {Name: '', Type: '<<资源>>', Annotation: '', figure: 'ExternalOrganization', nodeType: 'serviceValue', fill: '#f4d9ce', stroke: '#CDB7B5', strokeWidth: 2, font: '10pt Times New Roman', isUnderline: false, isStrikethrough: false, textAlign: 'center', strokeDashArray: null},
                {Name: '', Type: '<<服务>>', Annotation: '', figure: 'InternalStorage', nodeType: 'serviceValue', fill: '#e2c0c1', stroke: '#BC8F8F', strokeWidth: 2, font: '10pt Times New Roman', isUnderline: false, isStrikethrough: false, textAlign: 'center', strokeDashArray: null},
                {Name: '', Type: '<<目标>>', Annotation: '', figure: 'Ellipse', nodeType: 'serviceValue', fill: '#b0cdb9', stroke: '#2E8B57', strokeWidth: 2, font: '10pt Times New Roman', isUnderline: false, isStrikethrough: false, textAlign: 'center', strokeDashArray: null},
                {Name: '', Type: '<<角色>>', Annotation: '', figure: 'Actor', minSize: new go.Size(20, 20), width: 50, height: 70, nodeType: 'serviceValue', fill: '#eac49e', stroke: '#CDAA7D', strokeWidth: 2, font: '10pt Times New Roman', isUnderline: false, isStrikethrough: false, textAlign: 'center', strokeDashArray: null}

                // 英文版本
                // {Name: '', Type: '<<Value activity>>', Annotation: '', figure: 'Card', nodeType: 'serviceValue', fill: '#fad7a7', stroke: '#DAA520', strokeWidth: 2, font: '10pt Times New Roman', isUnderline: false, isStrikethrough: false, textAlign: 'center', strokeDashArray: null},
                // {Name: '', Type: '<<Value object>>', Annotation: '', figure: 'RoundedRectangle', nodeType: 'serviceValue', fill: '#f4e4d0', stroke: '#CDAA7D', strokeWidth: 2, font: '10pt Times New Roman', isUnderline: false, isStrikethrough: false, textAlign: 'center', strokeDashArray: null},
                // {Name: '', Type: '<<Resource>>', Annotation: '', figure: 'ExternalOrganization', nodeType: 'serviceValue', fill: '#f4d9ce', stroke: '#CDB7B5', strokeWidth: 2, font: '10pt Times New Roman', isUnderline: false, isStrikethrough: false, textAlign: 'center', strokeDashArray: null},
                // {Name: '', Type: '<<Service>>', Annotation: '', figure: 'InternalStorage', nodeType: 'serviceValue', fill: '#e2c0c1', stroke: '#BC8F8F', strokeWidth: 2, font: '10pt Times New Roman', isUnderline: false, isStrikethrough: false, textAlign: 'center', strokeDashArray: null},
                // {Name: '', Type: '<<Goal>>', Annotation: '', figure: 'Ellipse', nodeType: 'serviceValue', fill: '#b0cdb9', stroke: '#2E8B57', strokeWidth: 2, font: '10pt Times New Roman', isUnderline: false, isStrikethrough: false, textAlign: 'center', strokeDashArray: null},
                // {Name: '', Type: '<<Role>>', Annotation: '', figure: 'Actor', minSize: new go.Size(20, 20), width: 50, height: 70, nodeType: 'serviceValue', fill: '#eac49e', stroke: '#CDAA7D', strokeWidth: 2, font: '10pt Times New Roman', isUnderline: false, isStrikethrough: false, textAlign: 'center', strokeDashArray: null}

              ])
            }
          )
          if (this.$i18n.locale === 'en') {
            [this.modelType, this.relationType] = ['Elements of Vlue network', 'Relationship of Value network']
            this.search_types = [
              {value: null, text: 'Choose The Type of Element'},
              {value: '<<Value activity>>', text: 'Value activity'},
              {value: '<<Value object>>', text: 'Value object'},
              {value: '<<Resource>>', text: 'Resource'},
              {value: '<<Service>>', text: 'Service'},
              {value: '<<Goal>>', text: 'Goal'},
              {value: '<<Role>>', text: 'Role'}
            ]
          } else {
            [this.modelType, this.relationType] = ['价值网络模型元素', '价值网络模型关系']
            this.search_types = [
              {value: null, text: '选择元素类型'},
              {value: '<<价值活动>>', text: '价值活动'},
              {value: '<<资源>>', text: '资源'},
              {value: '<<服务>>', text: '服务'},
              {value: '<<目标>>', text: '目标'},
              {value: '<<角色>>', text: '角色'}
            ]
          }

          break
        }
        case 'GN': {
          if (this.$i18n.locale === 'en') {
            objGo(go.Palette, 'myPaletteDiv1', // must name or refer to the DIV HTML element
              { maxSelectionCount: 1,
                nodeTemplateMap: this.myDiagram.nodeTemplateMap,
                groupTemplateMap: this.myDiagram.groupTemplateMap,
                model: new go.GraphLinksModel([ // specify the contents of the Palette
                  { Name: '', Type: '<<Functional Goal>>', Annotation: '', figure: 'Pentagon', nodeType: 'target', fill: '#8FBC8F', stroke: '#2E8B57', strokeWidth: 2, font: '10pt Times New Roman', isUnderline: false, isStrikethrough: false, textAlign: 'center', strokeDashArray: null },
                  { Name: '', Type: '<<Nonfunctional Goal>>', Annotation: '', figure: 'LoopLimit', nodeType: 'target', fill: 'rgb(224,228,204)', stroke: 'rgb(184,188,164)', strokeWidth: 2, font: '10pt Times New Roman', isUnderline: false, isStrikethrough: false, textAlign: 'center', strokeDashArray: null },
                  { Name: '', Type: '<<Operational Goal>>', Annotation: '', figure: 'CreateRequest', nodeType: 'target', fill: '#c0d9a2', stroke: '#8FBC8F', strokeWidth: 2, font: '10pt Times New Roman', isUnderline: false, isStrikethrough: false, textAlign: 'center', strokeDashArray: null },
                  {Name: '', Type: '<<Resource>>', Annotation: '', figure: 'ExternalOrganization', nodeType: 'serviceValue', fill: '#f4d9ce', stroke: '#CDB7B5', strokeWidth: 2, font: '10pt Times New Roman', isUnderline: false, isStrikethrough: false, textAlign: 'center', strokeDashArray: null},
                  { Name: '', Type: '<<Constraint>>', Annotation: '', figure: 'File', nodeType: 'target', fill: 'whitesmoke', stroke: 'gray', strokeWidth: 2, font: '10pt Times New Roman', isUnderline: false, isStrikethrough: false, textAlign: 'center', strokeDashArray: null },
                  { Name: '', Type: '<<Actor>>', Annotation: '', minSize: new go.Size(20, 20), figure: 'Actor', width: 50, height: 70, nodeType: 'target', fill: '#eac49e', stroke: '#CDAA7D', strokeWidth: 2, font: '10pt Times New Roman', isUnderline: false, isStrikethrough: false, textAlign: 'center', strokeDashArray: null },
                  { Name: '', Type: '<<Actor Boundary>>', minSize: new go.Size(20, 20), fill: '#ffffff', isGroup: true, category: 'OfNodes', stroke: 'gray', strokeWidth: 2, font: '10pt Times New Roman', isUnderline: false, isStrikethrough: false, textAlign: 'center', strokeDashArray: null }
                ])
              })
          } else {
            objGo(go.Palette, 'myPaletteDiv1', // must name or refer to the DIV HTML element
              { maxSelectionCount: 1,
                nodeTemplateMap: this.myDiagram.nodeTemplateMap,
                groupTemplateMap: this.myDiagram.groupTemplateMap,
                model: new go.GraphLinksModel([ // specify the contents of the Palette
                  // 黑白调试中
                  // { Name: '', Type: '<<功能性目标>>', Annotation: '', figure: 'Pentagon', nodeType: 'target', fill: '#ffffff', stroke: 'gray', strokeWidth: 2, font: '10pt Times New Roman', isUnderline: false, isStrikethrough: false, textAlign: 'center', strokeDashArray: null },
                  // { Name: '', Type: '<<非功能性目标>>', Annotation: '', figure: 'LoopLimit', nodeType: 'target', fill: '#ffffff', stroke: 'gray', strokeWidth: 2, font: '10pt Times New Roman', isUnderline: false, isStrikethrough: false, textAlign: 'center', strokeDashArray: null },
                  // { Name: '', Type: '<<可操作性目标>>', Annotation: '', figure: 'CreateRequest', nodeType: 'target', fill: '#ffffff', stroke: 'gray', strokeWidth: 2, font: '10pt Times New Roman', isUnderline: false, isStrikethrough: false, textAlign: 'center', strokeDashArray: null },
                  // {Name: '', Type: '<<资源>>', Annotation: '', figure: 'ExternalOrganization', nodeType: 'serviceValue', fill: '#ffffff', stroke: 'gray', strokeWidth: 2, font: '10pt Times New Roman', isUnderline: false, isStrikethrough: false, textAlign: 'center', strokeDashArray: null},
                  // { Name: '', Type: '<<约束>>', Annotation: '', figure: 'File', nodeType: 'target', fill: '#ffffff', stroke: 'gray', strokeWidth: 2, font: '10pt Times New Roman', isUnderline: false, isStrikethrough: false, textAlign: 'center', strokeDashArray: null },
                  // { Name: '', Type: '<<角色>>', Annotation: '', minSize: new go.Size(20, 20), figure: 'Actor', width: 50, height: 70, nodeType: 'target', fill: '#ffffff', stroke: 'gray', strokeWidth: 2, font: '10pt Times New Roman', isUnderline: false, isStrikethrough: false, textAlign: 'center', strokeDashArray: null },
                  // { Name: '', Type: '<<角色作用域>>', minSize: new go.Size(20, 20), fill: '#ffffff', isGroup: true, category: 'OfNodes', stroke: 'gray', strokeWidth: 2, font: '10pt Times New Roman', isUnderline: false, isStrikethrough: false, textAlign: 'center', strokeDashArray: null }
                  // 彩色版本
                  { Name: '', Type: '<<功能性目标>>', Annotation: '', figure: 'Pentagon', nodeType: 'target', fill: '#8FBC8F', stroke: '#2E8B57', strokeWidth: 2, font: '10pt Times New Roman', isUnderline: false, isStrikethrough: false, textAlign: 'center', strokeDashArray: null },
                  { Name: '', Type: '<<非功能性目标>>', Annotation: '', figure: 'LoopLimit', nodeType: 'target', fill: 'rgb(224,228,204)', stroke: 'rgb(184,188,164)', strokeWidth: 2, font: '10pt Times New Roman', isUnderline: false, isStrikethrough: false, textAlign: 'center', strokeDashArray: null },
                  { Name: '', Type: '<<可操作性目标>>', Annotation: '', figure: 'CreateRequest', nodeType: 'target', fill: '#c0d9a2', stroke: '#8FBC8F', strokeWidth: 2, font: '10pt Times New Roman', isUnderline: false, isStrikethrough: false, textAlign: 'center', strokeDashArray: null },
                  {Name: '', Type: '<<资源>>', Annotation: '', figure: 'ExternalOrganization', nodeType: 'serviceValue', fill: '#f4d9ce', stroke: '#CDB7B5', strokeWidth: 2, font: '10pt Times New Roman', isUnderline: false, isStrikethrough: false, textAlign: 'center', strokeDashArray: null},
                  { Name: '', Type: '<<约束>>', Annotation: '', figure: 'File', nodeType: 'target', fill: 'whitesmoke', stroke: 'gray', strokeWidth: 2, font: '10pt Times New Roman', isUnderline: false, isStrikethrough: false, textAlign: 'center', strokeDashArray: null },
                  { Name: '', Type: '<<角色>>', Annotation: '', minSize: new go.Size(20, 20), figure: 'Actor', width: 50, height: 70, nodeType: 'target', fill: '#eac49e', stroke: '#CDAA7D', strokeWidth: 2, font: '10pt Times New Roman', isUnderline: false, isStrikethrough: false, textAlign: 'center', strokeDashArray: null },
                  { Name: '', Type: '<<角色作用域>>', minSize: new go.Size(20, 20), fill: '#ffffff', isGroup: true, category: 'OfNodes', stroke: 'gray', strokeWidth: 2, font: '10pt Times New Roman', isUnderline: false, isStrikethrough: false, textAlign: 'center', strokeDashArray: null }

                  // { Name: '', Type: '<<目标>>', Annotation: '', figure: 'Ellipse', nodeType: 'target', fill: '#b0cdb9', stroke: '#000000', strokeWidth: 2, font: '10pt Times New Roman', isUnderline: false, isStrikethrough: false, textAlign: 'center', strokeDashArray: null },

                  // { Name: '', Type: '<<角色>>', Annotation: '', minSize: new go.Size(20, 20), figure: 'Actor', width: 50, height: 70, nodeType: 'target', fill: '#eac49e', stroke: '#000000', strokeWidth: 2, font: '10pt Times New Roman', isUnderline: false, isStrikethrough: false, textAlign: 'center', strokeDashArray: null },
                  // // { Name: '', Type: '<<目标>>', Annotation: '', figure: 'Ellipse', nodeType: 'target', fill: '#b0cdb9', stroke: '#000000', strokeWidth: 2, font: '10pt Times New Roman', isUnderline: false, isStrikethrough: false, textAlign: 'center', strokeDashArray: null },
                  // { Name: '', Type: '<<约束>>', Annotation: '', figure: 'File', nodeType: 'target', fill: '#eac49e', stroke: '#000000', strokeWidth: 2, font: '10pt Times New Roman', isUnderline: false, isStrikethrough: false, textAlign: 'center', strokeDashArray: null },
                  // { Name: '', Type: '<<功能性目标>>', Annotation: '', figure: 'Pentagon', nodeType: 'target', fill: '#cbdab4', stroke: '#000000', strokeWidth: 2, font: '10pt Times New Roman', isUnderline: false, isStrikethrough: false, textAlign: 'center', strokeDashArray: null },
                  // { Name: '', Type: '<<非功能性目标>>', Annotation: '', figure: 'LoopLimit', nodeType: 'target', fill: '#e1efcc', stroke: '#000000', strokeWidth: 2, font: '10pt Times New Roman', isUnderline: false, isStrikethrough: false, textAlign: 'center', strokeDashArray: null },
                  // { Name: '', Type: '<<可操作性目标>>', Annotation: '', figure: 'CreateRequest', nodeType: 'target', fill: '#c0d9a2', stroke: '#000000', strokeWidth: 2, font: '10pt Times New Roman', isUnderline: false, isStrikethrough: false, textAlign: 'center', strokeDashArray: null }
                ])
              })
          }
          objGo(go.Palette, 'myPaletteDiv2',
            { maxSelectionCount: 1,
              linkTemplate:
                  objGo(go.Link,
                    {toolTip: tooltiptemplate},
                    { locationSpot: go.Spot.Center,
                      selectionAdorned: false,
                      curve: go.Link.JumpOver,
                      corner: 5,
                      toShortLength: 4,
                      routing: go.Link.AvoidsNodes
                    },
                    new go.Binding('points'),
                    objGo(go.Shape, // the link path shape
                      {isPanelMain: true, strokeWidth: 2, cursor: 'pointer'},
                      new go.Binding('strokeDashArray', 'strokeDashArray')
                    ),
                    objGo(go.Shape, // the to-arrowhead
                      new go.Binding('fromArrow', 'fromArrow'),
                      {fromArrow: '', strokeWidth: 1},
                      new go.Binding('fill', 'fromArrowFill')
                    ),
                    objGo(go.Shape, // the to-arrowhead
                      new go.Binding('toArrow', 'toArrow'),
                      {toArrow: '', strokeWidth: 1},
                      new go.Binding('fill', 'toArrowFill')
                    )
                  ),
              model: new go.GraphLinksModel( // specify the contents of the Palette
                [],
                [
                  {points: new go.List(go.Point).addAll([new go.Point(0, 0), new go.Point(50, 50)]), toArrow: 'Circle', toArrowFill: 'Transparent', Linktype: 'OR'},
                  {points: new go.List(go.Point).addAll([new go.Point(0, 0), new go.Point(50, 50)]), toArrow: 'Circle', Linktype: 'AND'},
                  {points: new go.List(go.Point).addAll([new go.Point(0, 0), new go.Point(50, 50)]), toArrow: 'DoubleFeathers', Linktype: '促进'},
                  {points: new go.List(go.Point).addAll([new go.Point(0, 0), new go.Point(50, 50)]), toArrow: 'OpenTriangleLine', Linktype: '阻碍'},
                  {points: new go.List(go.Point).addAll([new go.Point(0, 0), new go.Point(50, 50)]), toArrow: 'X', Linktype: '互斥'},
                  {points: new go.List(go.Point).addAll([new go.Point(0, 0), new go.Point(50, 50)]), toArrow: 'SidewaysV', Linktype: '依赖'}
                ])
            }
          )
          if (this.$i18n.locale === 'en') {
            [this.modelType, this.relationType] = ['Elements of Goal Model', 'Relationship of Goal Model']
            this.search_types = [
              {value: null, text: 'Choose The Type of Element'},
              {value: '<<Nonfunctional Goal>>', text: 'Nonfunctional Goal'},
              {value: '<<Functional Goal >>', text: 'Functional Goal '},
              {value: '<<Operational Goal>>', text: 'Operational Goal'},
              {value: '<<Resource>>', text: 'Resource'},
              {value: '<<Constraint>>', text: 'Constraint'},
              {value: '<<Actor>>', text: 'Actor'}
              // {value: '<<Actor Scope>>', text: 'Actor Scope'}

            ]
          } else {
            [this.modelType, this.relationType] = ['目标网络模型元素', '目标网络模型关系']
            this.search_types = [
              {value: null, text: '选择元素类型'},
              {value: '<<非功能性目标>>', text: '非功能性目标'},
              {value: '<<功能性目标>>', text: '功能性目标'},
              {value: '<<可操作性目标>>', text: '可操作性目标'},
              {value: '<<资源>>', text: '资源'},
              {value: '<<约束>>', text: '约束'},
              {value: '<<角色>>', text: '角色'}
              // {value: '<<角色作用域>>', text: '角色作用域'}

            ]
          }
          break
        }
      }
    }
  },
  methods: {
    clickbtnbox (item, index) {
      this.createSearchDiagram(item, index)
    },
    showChooseModel () {
      if (this.search_diagram_json.length === 0) { // 阻止在没有选项的情况下误操作
        alert('请先进行相关搜索。')
        return
      }
      this.activeclass = 'hidemapbox active'
    },
    changeFont () {
      let font = `${this.isBold ? 'bold' : ''} ${this.isItalic ? 'italic' : ''} ${this.selectedSize} ${this.selectedFont}`
      this.myDiagram.startTransaction('set all properties')
      this.myDiagram.selection.each((item) => {
        this.myDiagram.model.setDataProperty(item.data, 'font', font)
      })
      this.myDiagram.commitTransaction('set all properties')
    },
    largerSize () {
      if (this.selectedSize !== '15pt') this.selectedSize = parseInt(this.selectedSize) + 1 + 'pt'
      this.changeFont()
    },
    smallerSize () {
      if (this.selectedSize !== '6pt') this.selectedSize = parseInt(this.selectedSize) - 1 + 'pt'
      this.changeFont()
    },
    boldFont () {
      this.isBold = !this.isBold
      this.changeFont()
    },
    italicFont () {
      this.isItalic = !this.isItalic
      this.changeFont()
    },
    underlineFont () {
      this.myDiagram.startTransaction('set all properties')
      this.myDiagram.selection.each((item) => {
        this.myDiagram.model.setDataProperty(item.data, 'isUnderline', !item.data['isUnderline'])
      })
      this.myDiagram.commitTransaction('set all properties')
    },
    strikethroughFont () {
      this.myDiagram.startTransaction('set all properties')
      this.myDiagram.selection.each((item) => {
        this.myDiagram.model.setDataProperty(item.data, 'isStrikethrough', !item.data['isStrikethrough'])
      })
      this.myDiagram.commitTransaction('set all properties')
    },
    fillBackground () {
      this.myDiagram.startTransaction('set all properties')
      this.myDiagram.selection.each((item) => {
        this.myDiagram.model.setDataProperty(item.data, 'fill', this.$refs.fill.value)
      })
      this.myDiagram.commitTransaction('set all properties')
    },
    showGrid () {
      this.flag_showgrid = !this.flag_showgrid
    },
    changeStrokeColor () {
      this.myDiagram.startTransaction('set all properties')
      this.myDiagram.selection.each((item) => {
        this.myDiagram.model.setDataProperty(item.data, 'stroke', this.$refs.strokeColor.value)
      })
      this.myDiagram.commitTransaction('set all properties')
    },
    changeStrokeStyle () {
      this.myDiagram.startTransaction('set all properties')
      this.myDiagram.selection.each((item) => {
        switch (this.strokeStyle) {
          case 'dashed':this.myDiagram.model.setDataProperty(item.data, 'strokeDashArray', [8, 2]); break
          case 'dotted':this.myDiagram.model.setDataProperty(item.data, 'strokeDashArray', [2, 2]); break
          default :this.myDiagram.model.setDataProperty(item.data, 'strokeDashArray', null); break
        }
      })
      this.myDiagram.commitTransaction('set all properties')
    },
    changeCrossover () {
      this.myDiagram.startTransaction('set all properties')
      this.myDiagram.selection.each((item) => {
        this.myDiagram.model.setDataProperty(item.data, 'strokeWidth', this.isCrossover ? 5 : 2)
      })
      this.myDiagram.commitTransaction('set all properties')
    },
    outportFile () {
      switch (this.selectedFormat) {
        case 'XML': {
          let getxml = this.diagram.diagramName + '.xml'
          let temp = JSON.parse(this.myDiagram.model.toJson())
          let xmlText = this.Json2XML(JSON.stringify(temp))
          this.doSave(xmlText, 'text/xml', getxml)
          break
        }
        case 'JSON': {
          let temp = JSON.parse(this.myDiagram.model.toJson())
          var getjson = this.diagram.diagramName + '.json'
          this.doSave(JSON.stringify(temp), 'text/latex', getjson)
          break
        }
        case 'PNG': {
          var getpng = this.diagram.diagramName + '.png'
          // eslint-disable-next-line one-var
          let bstr = atob(this.myDiagram.makeImageData({scale: 2}).split(',')[1]), n = bstr.length, u8arr = new Uint8Array(n)
          while (n--) {
            u8arr[n] = bstr.charCodeAt(n)
          }
          this.doSave(u8arr, 'image/png', getpng)
          break
        }
        case 'RDF': {
          var getrdf = this.diagram.diagramName + '.rdf'
          let rdf = this.Json2Rdf()
          this.doSave(rdf, 'text/rdf', getrdf)
          break
        }
        case 'SVG': {
          var getsvg = this.diagram.diagramName + '.svg'
          // eslint-disable-next-line one-var
          let bstr = new XMLSerializer().serializeToString(this.myDiagram.makeSvg()), n = bstr.length, u8arr = new Uint8Array(n)
          while (n--) {
            u8arr[n] = bstr.charCodeAt(n)
          }
          this.doSave(u8arr, 'image/svg+xml', getsvg)
          break
        }
      }
    },
    Json2Rdf () {
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
      console.log(linkArray.length)
      for (let j = 0; j < linkArray.length; j++) {
        let linkType = linkArray[j].Linktype
        console.log(linkType)
        linkType = linkType === undefined ? '普通连接' : linkType
        let node = xmlDoc.createElement('si' + linkType)
        let text = root.children[mapping.indexOf(linkArray[j].to)].getAttribute('rdf:about')
        let textNode = xmlDoc.createTextNode(text)
        node.appendChild(textNode)
        root.children[mapping.indexOf(linkArray[j].from)].appendChild(node)
      }
      return '<?xml version="1.0" encoding="utf-8"?>\n\n' + new XMLSerializer().serializeToString(xmlDoc)
    },
    undo () {
      this.myDiagram.commandHandler.undo()
    },
    redo () {
      this.myDiagram.commandHandler.redo()
    },
    cutSelection () {
      this.myDiagram.commandHandler.cutSelection()
    },
    copySelection () {
      this.myDiagram.commandHandler.copySelection()
    },
    pasteSelection () {
      this.myDiagram.commandHandler.pasteSelection(this.myDiagram.lastInput.documentPoint)
    },
    groupSelection () {
      this.myDiagram.commandHandler.groupSelection()
    },
    ungroupSelection () {
      this.myDiagram.commandHandler.ungroupSelection()
    },
    setDock (num) {
      if (this.shownDock === num) { this.shownDock = 0 } else this.shownDock = num
    },
    saveDiagram (exit = false) {
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
            if (exit === true) { this.$router.back(-1) }
          }
        })
        .catch((error) => {
          alert('保存失败，请重试')
          console.log(error)
        })
    },
    save () {
      this.saveDiagramProperties() // do this first, before writing to JSON
      this.imageData = this.myDiagram.makeImageData({size: new go.Size(318, 178), background: '#DAE4EE'})
      this.diagramAnalysis()
      this.myDiagram.isModified = false
    },

    load (jsonText) {
      this.imageData = this.myDiagram.makeImageData({background: '#DAE4EE'})
      this.myDiagram.model = go.Model.fromJson(jsonText)
      this.loadDiagramProperties() // do this after the Model.modelData has been brought into memory
    },

    /* search operation */
    search () {
      this.search_diagram = []
      this.search_diagram_json = []
      this.$ajax.get('api/diagram/relevantpart', {
        params: {
          searchName: this.search_content,
          searchType: this.search_type
        }})
        .then((response) => {
          console.log(response)
          const code = response.data.code
          if (code === 1) {
            this.search_diagram_json = response.data.data
          }
        })
        .catch((error) => {
          alert('检索结果为空')
          console.log(error)
        })
    },
    createSearchDiagram (diagramjson, index) {
      // 只要点击就执行
      this.activeclass = 'hidemapbox'
      console.log(index)
      console.log(this.chooseindex)
      if (index === this.chooseindex) {
        // 第二次点击执行
        console.log('x')
        this.chooseText = '请选择模板片段'

        return // 阻止二次点击选择被关闭的影响
      }
      // 第一次点击的时候执行
      if (this.search_diagram[index] === null || this.search_diagram[index] === undefined) {
        this.search_diagram[index] = objGo(go.Palette, 'mySearchDiagram' + index,
          {
            nodeTemplateMap: this.myDiagram.nodeTemplateMap,
            model: go.Model.fromJson(diagramjson)
          }
        )
      }
      this.search_diagram[index].commandHandler.selectAll()
      this.chooseindex = index + 1
      this.chooseText = this.btnText + '' + this.chooseindex
      this.chooseindex = index
    },
    saveDiagramProperties () {
      this.myDiagram.model.modelData.position = go.Point.stringify(this.myDiagram.position)
    },
    loadDiagramProperties (e) {
      // set Diagram.initialPosition, not Diagram.position, to handle initialization side-effects
      let pos = this.myDiagram.model.modelData.position
      if (pos) this.myDiagram.initialPosition = go.Point.parse(pos)
    },

    Json2XML (jsonText) {
      let xotree = new XML.ObjTree()
      let jsonTextWithParent = {'myData': JSON.parse(jsonText)}
      let xmlText = xotree.writeXML(jsonTextWithParent)
      return xmlText
    },

    XML2Json (xmlText) {
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
          node.strokeDashArray.forEach(function (v, i, a) {
            a[i] = parseInt(v)
          })
        }
      }
      jsonText = JSON.stringify(jsonObject)
      return jsonText
    },
    mixGoalFile (files) {
      this.isMixed = true
    },
    identifyGoalBox () {
      // 获取主模型
      let AjsonObj = JSON.parse(this.myDiagram.model.toJson())
      let anodeArray = AjsonObj.nodeDataArray.concat()
      let num = anodeArray.length
      let userGoalArray = []
      let depdGoalArray = []
      let userRoleKeys = []
      for (let i = 0; i < num; i++) {
        if ((anodeArray[i].Type === '<<角色作用域>>') || (anodeArray[i].Type === '<<Actor Boundary>>')) {
          if (anodeArray[i].Name.endsWith('user') || anodeArray[i].Name.endsWith('User') || anodeArray[i].Name.endsWith('用户')) {
            userRoleKeys.push(anodeArray[i].key + '')
          }
        }
      }
      for (let i = 0; i < num; i++) {
        if ((anodeArray[i].Type === '<<功能性目标>>') || (anodeArray[i].Type === '<<Functional Goal>>')) {
          if (userRoleKeys.includes(anodeArray[i].group + '')) {
            userGoalArray.push({text: anodeArray[i].Name, value: anodeArray[i].key})
          }
        }
      }
      this.mixUserGoals = userGoalArray.concat()
      for (let i = 0; i < num; i++) {
        if ((anodeArray[i].Type === '<<功能性目标>>') || (anodeArray[i].Type === '<<Functional Goal>>')) {
          if (!userRoleKeys.includes(anodeArray[i].group + '')) {
            depdGoalArray.push({text: anodeArray[i].Name, value: anodeArray[i].key})
          }
        }
      }
      this.mixDepdGoals = depdGoalArray.concat()
      this.isDisable1 = false
      this.isDisable2 = true
    },
    chooseMixGoal () {
      this.newGoals.push(this.userGoalKey + '')
      this.newGoals.push(this.depdGoalKey + '')
      this.identifyRedBox(this.newGoals)
      this.isDisable1 = true
      this.isDisable2 = false
    },
    importSubModel () {
      this.$ajax.put('api/mix/submodel', {
        'userGoal': this.newGoals[0],
        'jsonContent': JSON.stringify(JSON.parse(this.myDiagram.model.toJson()))
      })
        .then((response) => {
          const code = response.data.code
          if (code === 1) {
            // 展示辅文件名字
            this.mixdiagramName = response.data.data[0]
            this.mixdiagramSimilarity = response.data.data[1]
            this.isSubShow = true
            let keys = []
            let leg = response.data.data.length
            for (let i = 3; i < leg; i++) {
              keys.push(response.data.data[i])
            }
            this.showSubModel(response.data.data[2], keys)
            let keys1 = []
            keys1.push(keys[0])
            this.identifyRedBox(keys1)
            keys.shift()
            this.yellowGoals = keys.concat()
            this.identifyRedBox(keys, 'yellow')
          }
        })
        .catch((error) => {
          alert('识别失败，请重试')
          console.log(error)
        })
    },
    showSubModel (subModel) {
      // let subModel = '{"class":"GraphLinksModel","modelData":{"position":"-963.0999552408853 -354"},"nodeDataArray":[{"Name":"Payment service","Type":"<<资源>>","Annotation":"","figure":"ExternalOrganization","nodeType":"serviceValue","fill":"#f4d9ce","stroke":"#CDB7B5","strokeWidth":2,"font":"bold  10pt Times New Roman","isUnderline":false,"isStrikethrough":false,"textAlign":"center","strokeDashArray":null,"key":-4,"loc":"-400 -90","size":"85 31"},{"Name":"Ant insurance","Type":"<<角色作用域>>","minSize":{"class":"go.Size","width":20,"height":20},"fill":"#ffffff","isGroup":true,"category":"OfNodes","stroke":"gray","strokeWidth":2,"font":"bold  12pt Times New Roman","isUnderline":false,"isStrikethrough":false,"textAlign":"center","strokeDashArray":null,"key":-15,"Annotation":""},{"Name":"Guarantee mechanism provided for users to reduce the loss","Type":"<<功能性目标>>","Annotation":"","figure":"Pentagon","nodeType":"target","fill":"#8FBC8F","stroke":"#2E8B57","strokeWidth":2,"font":"bold  10pt Times New Roman","isUnderline":false,"isStrikethrough":false,"textAlign":"center","strokeDashArray":null,"key":-16,"loc":"-403 32","group":-15,"Operation":"undefined","Object":"undefined","size":"224 84"},{"Name":"Provide insurance purchase","Type":"<<可操作性目标>>","Annotation":"","figure":"CreateRequest","nodeType":"target","fill":"#c0d9a2","stroke":"#8FBC8F","strokeWidth":2,"font":"bold  10pt Times New Roman","isUnderline":false,"isStrikethrough":false,"textAlign":"center","strokeDashArray":null,"key":-17,"loc":"-503 212","group":-15,"size":"114 44"},{"Name":"Commissioned the insurance company","Type":"<<可操作性目标>>","Annotation":"","figure":"CreateRequest","nodeType":"target","fill":"#c0d9a2","stroke":"#8FBC8F","strokeWidth":2,"font":"bold  10pt Times New Roman","isUnderline":false,"isStrikethrough":false,"textAlign":"center","strokeDashArray":null,"key":-18,"loc":"-322.5 212","group":-15,"size":"116 45"},{"Name":"Insurance company","Type":"<<角色>>","Annotation":"","minSize":{"class":"go.Size","width":20,"height":20},"figure":"Actor","width":50,"height":70,"nodeType":"target","fill":"#eac49e","stroke":"#CDAA7D","strokeWidth":2,"font":"bold  10pt Times New Roman","isUnderline":false,"isStrikethrough":false,"textAlign":"center","strokeDashArray":null,"key":-19,"loc":"-606 280","size":"113 74"},{"Name":"Insurance data","Type":"<<资源>>","Annotation":"","figure":"ExternalOrganization","nodeType":"serviceValue","fill":"#f4d9ce","stroke":"#CDB7B5","strokeWidth":2,"font":"bold  10pt Times New Roman","isUnderline":false,"isStrikethrough":false,"textAlign":"center","strokeDashArray":null,"key":-21,"loc":"-492 -89","size":"78 32"},{"Name":"Alipay","Type":"<<角色>>","Annotation":"","minSize":{"class":"go.Size","width":20,"height":20},"figure":"Actor","width":50,"height":70,"nodeType":"target","fill":"#eac49e","stroke":"#CDAA7D","strokeWidth":2,"font":"bold  12pt Times New Roman","isUnderline":false,"isStrikethrough":false,"textAlign":"center","strokeDashArray":null,"key":-22,"loc":"-290 -90","size":"83 47"},{"Name":"Insurance service","Type":"<<资源>>","Annotation":"","figure":"ExternalOrganization","nodeType":"serviceValue","fill":"#f4d9ce","stroke":"#CDB7B5","strokeWidth":2,"font":"bold  10pt Times New Roman","isUnderline":false,"isStrikethrough":false,"textAlign":"center","strokeDashArray":null,"key":-23,"loc":"-322.5 280","size":"107 32"},{"Name":"User","Type":"<<角色作用域>>","minSize":{"class":"go.Size","width":20,"height":20},"fill":"#ffffff","isGroup":true,"category":"OfNodes","stroke":"gray","strokeWidth":2,"font":"bold  12pt Times New Roman","isUnderline":false,"isStrikethrough":false,"textAlign":"center","strokeDashArray":null,"key":-7,"Annotation":""},{"Name":"Reduce loss","Type":"<<功能性目标>>","Annotation":"","figure":"Pentagon","nodeType":"target","fill":"#8FBC8F","stroke":"#2E8B57","strokeWidth":2,"font":"bold  10pt Times New Roman","isUnderline":false,"isStrikethrough":false,"textAlign":"center","strokeDashArray":null,"key":-1,"loc":"-412 -453","group":-7,"Operation":"undefined","Object":"undefined","size":"114 35"},{"Name":"Organize insurance bought online","Type":"<<可操作性目标>>","Annotation":"","figure":"CreateRequest","nodeType":"target","fill":"#c0d9a2","stroke":"#8FBC8F","strokeWidth":2,"font":"bold  10pt Times New Roman","isUnderline":false,"isStrikethrough":false,"textAlign":"center","strokeDashArray":null,"key":-3,"loc":"-492 -310","group":-7,"size":"120 46"},{"Name":"Organize insurance bought offline","Type":"<<可操作性目标>>","Annotation":"","figure":"CreateRequest","nodeType":"target","fill":"#c0d9a2","stroke":"#8FBC8F","strokeWidth":2,"font":"bold  10pt Times New Roman","isUnderline":false,"isStrikethrough":false,"textAlign":"center","strokeDashArray":null,"key":-8,"loc":"-332 -310","group":-7,"size":"120 46"},{"Name":"Choose insurance online","Type":"<<可操作性目标>>","Annotation":"","figure":"CreateRequest","nodeType":"target","fill":"#c0d9a2","stroke":"#8FBC8F","strokeWidth":2,"font":"bold  10pt Times New Roman","isUnderline":false,"isStrikethrough":false,"textAlign":"center","strokeDashArray":null,"key":-9,"loc":"-612 -230","group":-7,"size":"97 44"},{"Name":"Buy insurance online","Type":"<<可操作性目标>>","Annotation":"","figure":"CreateRequest","nodeType":"target","fill":"#c0d9a2","stroke":"#8FBC8F","strokeWidth":2,"font":"bold  10pt Times New Roman","isUnderline":false,"isStrikethrough":false,"textAlign":"center","strokeDashArray":null,"key":-10,"loc":"-492 -230","group":-7,"size":"89 43"},{"Name":"Pay by Alipay","Type":"<<可操作性目标>>","Annotation":"","figure":"CreateRequest","nodeType":"target","fill":"#c0d9a2","stroke":"#8FBC8F","strokeWidth":2,"font":"bold  10pt Times New Roman","isUnderline":false,"isStrikethrough":false,"textAlign":"center","strokeDashArray":null,"key":-11,"loc":"-442 -160","group":-7,"size":"62 34"},{"Name":"Insurance bought to reduce loss","Type":"<<功能性目标>>","Annotation":"","figure":"Pentagon","nodeType":"target","fill":"#8FBC8F","stroke":"#2E8B57","strokeWidth":2,"font":"bold  10pt Times New Roman","isUnderline":false,"isStrikethrough":false,"textAlign":"center","strokeDashArray":null,"key":-24,"loc":"-412 -383","group":-7,"Operation":"undefined","Object":"undefined","size":"109 73"},{"Name":"Convenient payment","Type":"<<非功能性目标>>","Annotation":"","figure":"LoopLimit","nodeType":"target","fill":"rgb(224,228,204)","stroke":"rgb(184,188,164)","strokeWidth":2,"font":"bold  10pt Times New Roman","isUnderline":false,"isStrikethrough":false,"textAlign":"center","strokeDashArray":null,"key":-2,"loc":"-592 -160","group":-7,"Degree":"","NFR Type":"","size":"76 43"},{"Name":"Pay for insurance online","Type":"<<可操作性目标>>","Annotation":"","figure":"CreateRequest","nodeType":"target","fill":"#c0d9a2","stroke":"#8FBC8F","strokeWidth":2,"font":"bold  10pt Times New Roman","isUnderline":false,"isStrikethrough":false,"textAlign":"center","strokeDashArray":null,"key":-20,"loc":"-362 -230","group":-7,"size":"96 41"},{"Name":"Pay by credit card","Type":"<<可操作性目标>>","Annotation":"","figure":"CreateRequest","nodeType":"target","fill":"#c0d9a2","stroke":"#8FBC8F","strokeWidth":2,"font":"bold  10pt Times New Roman","isUnderline":false,"isStrikethrough":false,"textAlign":"center","strokeDashArray":null,"key":-25,"loc":"-362 -160","group":-7,"size":"65 33"},{"Name":"Pay by other means","Type":"<<可操作性目标>>","Annotation":"","figure":"CreateRequest","nodeType":"target","fill":"#c0d9a2","stroke":"#8FBC8F","strokeWidth":2,"font":"bold  10pt Times New Roman","isUnderline":false,"isStrikethrough":false,"textAlign":"center","strokeDashArray":null,"key":-26,"loc":"-282 -160","group":-7,"size":"73 32"},{"Name":"Insurance service provided to reduce loss","Type":"<<功能性目标>>","Annotation":"","figure":"Pentagon","nodeType":"target","fill":"#8FBC8F","stroke":"#2E8B57","strokeWidth":2,"font":"bold  10pt Times New Roman","isUnderline":false,"isStrikethrough":false,"textAlign":"center","strokeDashArray":null,"key":-27,"loc":"-403 132","group":-15,"Operation":"","Object":"","size":"165 75"}],"linkDataArray":[{"from":-4,"to":-22,"points":[-357.5,-90,-347.5,-90,-344.5,-90,-344.5,-90,-341.5,-90,-331.5,-90]},{"from":-21,"to":-17,"points":[-531,-89,-541,-89,-540,-89,-540,-89,-616.65625,-89,-616.65625,212,-570,212,-560,212]},{"from":-18,"to":-17,"points":[-380.5,212,-390.5,212,-413.25,212,-413.25,212,-436,212,-446,212]},{"from":-23,"to":-19,"points":[-376,280,-386,280,-462.75,280,-462.75,280,-539.5,280,-549.5,280]},{"points":[-412,-438.65121959281333,-412,-428.65121959281333,-412,-428.65121959281333,-412,-429.5,-412,-429.5,-412,-419.5],"toArrow":"Circle","Linktype":"AND","from":-1,"to":-24},{"points":[-357.5,-383,-347.5,-383,-332,-383,-332,-363,-332,-343,-332,-333],"toArrow":"Circle","toArrowFill":"Transparent","Linktype":"OR","from":-24,"to":-8},{"points":[-458.50981824683413,-383,-468.50981824683413,-383,-492,-383,-492,-363,-492,-343,-492,-333],"toArrow":"Circle","toArrowFill":"Transparent","Linktype":"OR","from":-24,"to":-3},{"points":[-492,-287,-492,-277,-492,-269.25,-492,-269.25,-492,-261.5,-492,-251.5],"toArrow":"Circle","Linktype":"AND","from":-3,"to":-10},{"points":[-432,-310,-422,-310,-420,-310,-420,-276,-362,-276,-362,-260.5,-362,-250.5],"toArrow":"Circle","Linktype":"AND","from":-3,"to":-20},{"points":[-552,-310,-562,-310,-562,-274,-612,-274,-612,-262,-612,-252],"toArrow":"Circle","Linktype":"AND","from":-3,"to":-9},{"points":[-536.5,-230,-546.5,-230,-550,-230,-550,-230,-553.5,-230,-563.5,-230],"toArrow":"SidewaysV","Linktype":"依赖","from":-10,"to":-9},{"points":[-410,-230,-420,-230,-428.75,-230,-428.75,-230,-437.5,-230,-447.5,-230],"toArrow":"SidewaysV","Linktype":"依赖","from":-20,"to":-10},{"points":[-362,-209.5,-362,-199.5,-362,-192.75,-282,-192.75,-282,-186,-282,-176],"toArrow":"Circle","toArrowFill":"Transparent","Linktype":"OR","from":-20,"to":-26},{"points":[-362,-209.5,-362,-199.5,-362,-193,-362,-193,-362,-186.5,-362,-176.5],"toArrow":"Circle","toArrowFill":"Transparent","Linktype":"OR","from":-20,"to":-25},{"points":[-362,-209.5,-362,-199.5,-362,-193.25,-442,-193.25,-442,-187,-442,-177],"toArrow":"Circle","toArrowFill":"Transparent","Linktype":"OR","from":-20,"to":-11},{"points":[-473,-160,-483,-160,-513.5,-160,-513.5,-160,-544,-160,-554,-160],"toArrow":"DoubleFeathers","Linktype":"促进","from":-11,"to":-2},{"points":[-442,-143,-442,-133,-442,-132,-400,-132,-400,-115.5,-400,-105.5],"toArrow":"SidewaysV","Linktype":"依赖","from":-11,"to":-4},{"points":[-492,-208.5,-492,-198.5,-492,-198.5,-492,-198.5,-492,-115,-492,-105],"toArrow":"SidewaysV","Linktype":"依赖","from":-10,"to":-21},{"points":[-403,74,-403,84,-403,84.25,-403,84.25,-403,84.5,-403,94.5],"toArrow":"Circle","Linktype":"AND","from":-16,"to":-27},{"points":[-332.6719591193088,132,-322.6719591193088,132,-322.6719591193088,179.5,-322.6719591193088,179.5,-322.5,179.5,-322.5,189.5],"toArrow":"Circle","Linktype":"AND","from":-27,"to":-18},{"points":[-485.5,132,-495.5,132,-503,132,-503,156,-503,180,-503,190],"toArrow":"Circle","Linktype":"AND","from":-27,"to":-17},{"points":[-322.5,234.5,-322.5,244.5,-322.5,244.5,-322.5,244.5,-322.5,254,-322.5,264],"toArrow":"SidewaysV","Linktype":"依赖","from":-18,"to":-23}]}'
      let BjsonObj = JSON.parse(subModel)
      // 计算主模型的最右点位置
      let AjsonObj = JSON.parse(this.myDiagram.model.toJson())
      let alinkArray = AjsonObj.linkDataArray
      let anodeArray = AjsonObj.nodeDataArray
      let rightPointest = 0.0
      let leftPointest = 0.0
      let upPoint = 0.0
      let downPoint = 0.0
      for (let p = 0; p < anodeArray.length; p++) {
        if (anodeArray[p].loc !== undefined) {
          let location = anodeArray[p].loc.split(' ')
          let x = parseFloat(location[0])
          if (x < leftPointest) {
            leftPointest = x + 0.0
          }
          if (x > rightPointest) {
            rightPointest = x + 0.0
          }
          let y = parseFloat(location[1])
          if (y < upPoint) {
            upPoint = y + 0.0
          }
          if (y > downPoint) {
            downPoint = y + 0.0
          }
        }
      }
      let linkArray = BjsonObj.linkDataArray
      let nodeArray = BjsonObj.nodeDataArray
      let BleftPointest = 0.0
      for (let p = 0; p < nodeArray.length; p++) {
        if (nodeArray[p].loc !== undefined) {
          let location = nodeArray[p].loc.split(' ')
          let x = parseFloat(location[0])
          if (x < BleftPointest) {
            BleftPointest = x + 0.0
          }
          let y = parseFloat(location[1])
          if (y < upPoint) {
            upPoint = y + 0.0
          }
          if (y > downPoint) {
            downPoint = y + 0.0
          }
        }
      }
      let moveLength = 0.0
      let splitLineX = 0.0
      if (BleftPointest >= rightPointest) {
        moveLength = 300.0
        splitLineX = (BleftPointest - rightPointest + 300.0) / 2.0 + rightPointest
      } else {
        moveLength = rightPointest - BleftPointest + 300.0
        splitLineX = BleftPointest + moveLength - 180.0
      }
      this.splitLineLocX = splitLineX
      for (let i = 0; i < nodeArray.length; i++) {
        nodeArray[i].key = nodeArray[i].key + '_sub'
        if (nodeArray[i].group !== undefined) {
          nodeArray[i].group = nodeArray[i].group + '_sub'
        }
        if (nodeArray[i].loc !== undefined) {
          let location = nodeArray[i].loc.split(' ')
          let x = parseFloat(location[0]) + moveLength
          let y = parseFloat(location[1])
          // console.log(x)
          // console.log(y)
          nodeArray[i].loc = x.toString() + ' ' + y.toString()
          // nodeArray[i].loc
        }
      }
      for (let j = 0; j < linkArray.length; j++) {
        linkArray[j].to = linkArray[j].to + '_sub'
        linkArray[j].from = linkArray[j].from + '_sub'
        let pointSet = linkArray[j].points
        for (let p = 0; p < pointSet.length; p++) {
          pointSet[p] = pointSet[p] + moveLength
          p++
        }
        linkArray[j].points = pointSet
      }

      for (let i = 0; i < anodeArray.length; i++) {
        nodeArray.push(anodeArray[i])
      }
      for (let j = 0; j < alinkArray.length; j++) {
        linkArray.push(alinkArray[j])
      }
      // 添加分割虚线
      let link = {}
      let linePointsSet = []
      linePointsSet.push(splitLineX)
      linePointsSet.push(upPoint - 1250.0)
      linePointsSet.push(splitLineX)
      linePointsSet.push(downPoint + 1250.0)
      link.points = linePointsSet
      link.strokeDashArray = [1, 3]
      link.toArrow = ''
      link.Linktype = '虚线'
      linkArray.push(link)
      // 将模型展示在画板中
      this.imageData = this.myDiagram.makeImageData({background: '#DAE4EE'})
      this.myDiagram.model = go.Model.fromJson(JSON.stringify(BjsonObj))
      this.loadDiagramProperties()
      this.isDisable1 = true
      this.isDisable2 = true
      this.isDis1 = true
      this.isDis2 = false
    },
    secondStep () {
      this.isDisable1 = false
    },
    identifySubRedBox () {
      // 获取主模型
      let AjsonObj = JSON.parse(this.myDiagram.model.toJson())
      let anodeArray = AjsonObj.nodeDataArray.concat()
      let nodeArray = []
      let target = '_sub'
      for (let i = 0; i < anodeArray.length; i++) {
        let key = anodeArray[i].key + ''
        let start = key.length - target.length
        let arr = key.substr(start, target.length)
        if (arr === target) {
          continue
        }
        nodeArray.push(anodeArray[i])
      }
      AjsonObj.nodeDataArray = nodeArray.concat()
      AjsonObj.linkDataArray = null
      this.$ajax.put('api/mix/submodel', {
        'domainName': this.domainName,
        'jsonContent': JSON.stringify(AjsonObj)
      })
        .then((response) => {
          console.log(response)
          const code = response.data.code
          if (code === 1) {
            let keys = response.data.data
            let keys1 = []
            keys1.push(keys[0])
            this.identifyRedBox(keys1)
            keys.shift()
            this.identifyRedBox(keys, 'yellow')
            this.isDisable1 = true
            this.isDisable2 = false
          }
        })
        .catch((error) => {
          alert('识别失败，请重试')
          console.log(error)
        })
      // let keys1 = []
      // keys1.push('-1_sub')
      // this.identifyRedBox(keys1)
      // let keys2 = []
      // keys2.push('-24_sub')
      // keys2.push('-3_sub')
      // keys2.push('-8_sub')
      // keys2.push('-9_sub')
      // keys2.push('-10_sub')
      // keys2.push('-2_sub')
      // keys2.push('-11_sub')
      // keys2.push('-20_sub')
      // keys2.push('-25_sub')
      // keys2.push('-26_sub')
      // this.identifyRedBox(keys2, 'yellow')
      // this.isDisable1 = true
      // this.isDisable2 = false
    },

    identifyRedBox (keys, color = 'red') {
      // console.log(keys)
      let jsonObj = JSON.parse(this.myDiagram.model.toJson())
      let nodeArray = jsonObj.nodeDataArray
      // let linkArray = jsonObj.linkDataArray
      for (let i = 0; i < nodeArray.length; i++) {
        if (keys.includes(nodeArray[i].key + '')) {
          if (nodeArray[i].isGroup !== true) {
            console.log('find')
            nodeArray[i].stroke = color
            nodeArray[i].strokeWidth = 3
            nodeArray[i].strokeDashArray = [4, 2]
          }
        }
      }
      this.imageData = this.myDiagram.makeImageData({background: '#DAE4EE'})
      this.myDiagram.model = go.Model.fromJson(JSON.stringify(jsonObj))
      this.loadDiagramProperties()
    },
    generateTemplateFrag () {
      let keys = this.yellowGoals
      // keys.push('-24_sub')
      // keys.push('-3_sub')
      // keys.push('-8_sub')
      // keys.push('-9_sub')
      // keys.push('-10_sub')
      // keys.push('-2_sub')
      // keys.push('-11_sub')
      // keys.push('-20_sub')
      // keys.push('-25_sub')
      // keys.push('-26_sub')
      this.copyNodesLinks(keys)
      this.isDisable1 = true
      this.isDisable2 = true
      this.isDis2 = true
      this.isDis3 = false
    },
    thirdStep () {
      this.deleteModelColor()
      let depGoals = this.newGoals.concat()
      depGoals.shift()
      this.identifyRedBox(depGoals)
      this.isDisable1 = false
      let keys = this.yellowGoals
      let groupKey = this.myDiagram.findNodeForKey(keys[0]).data.group
      let jsonObj = JSON.parse(this.myDiagram.model.toJson())
      let nodeArray = jsonObj.nodeDataArray
      let linkArray = jsonObj.linkDataArray
      // let dependenceArray = []
      // let target = '_sub'
      let groupNodes = []
      for (let i = 0; i < nodeArray.length; i++) {
        if (nodeArray[i].group === groupKey) {
          groupNodes.push(nodeArray[i].key)
        }
      }
      let firstNodes = []
      for (let i = 0; i < linkArray.length; i++) {
        if (groupNodes.includes(linkArray[i].to + '') && (groupNodes.includes(linkArray[i].from + ''))) {
          continue
        } else {
          if (keys.includes(linkArray[i].to + '')) {
            firstNodes.push(linkArray[i].from)
          }
          if (keys.includes(linkArray[i].from + '')) {
            firstNodes.push(linkArray[i].to)
          }
        }
      }
      this.relevantNodes(firstNodes)
      let relevantDeps = []
      for (let i = 0; i < firstNodes.length; i++) {
        if (!groupNodes.includes(firstNodes[i])) {
          relevantDeps.push(firstNodes[i])
        }
      }
      let groupsKey = []
      for (let i = 0; i < relevantDeps.length; i++) {
        let key = this.myDiagram.findNodeForKey(relevantDeps[i]).data.group
        if ((key !== undefined) && (!groupsKey.includes(key))) {
          groupsKey.push(key)
        }
      }
      for (let i = 0; i < groupsKey.length; i++) {
        relevantDeps.push(groupsKey[i])
      }
      // for (let i = 0; i < nodeArray.length; i++) {
      //   let key = nodeArray[i].key + ''
      //   let start = key.length - target.length
      //   let arr = key.substr(start, target.length)
      //   if (arr === target) {
      //     if (keys.includes(nodeArray[i].key + '')) {
      //       continue
      //     } else {
      //       if (nodeArray[i].key !== groupKey) {
      //         if (nodeArray[i].group !== groupKey) {
      //           dependenceArray.push(nodeArray[i].key)
      //         }
      //       }
      //     }
      //   }
      // }
      this.yellowGoals = relevantDeps.concat()
      this.identifyRedBox(relevantDeps, 'yellow')
    },
    relevantNodes (nodes) {
      let jsonObj = JSON.parse(this.myDiagram.model.toJson())
      let linkArray = jsonObj.linkDataArray
      for (let n = 0; n < nodes.length; n++) {
        for (let i = 0; i < linkArray.length; i++) {
          if (linkArray[i].from === nodes[n]) {
            if (!nodes.includes(linkArray[i].to)) {
              nodes.push(linkArray[i].to)
            }
          }
          if (linkArray[i].to === nodes[n]) {
            if (!nodes.includes(linkArray[i].from)) {
              nodes.push(linkArray[i].from)
            }
          }
        }
      }
    },
    identifyDependent () {
      this.copyNodesLinks(this.yellowGoals)
      this.isDisable1 = true
      this.isDisable2 = false
    },
    mixedDependent () {
      this.deleteModelColor('sub')
      let jsonObj = JSON.parse(this.myDiagram.model.toJson())
      let nodeArray = jsonObj.nodeDataArray
      let depkeys = this.yellowGoals
      let dependenceArray = []
      for (let i = 0; i < nodeArray.length; i++) {
        if (depkeys.includes(nodeArray[i].key + '')) {
          dependenceArray.push(nodeArray[i])
        }
      }
      jsonObj.nodeDataArray = dependenceArray.concat()
      jsonObj.linkDataArray = []
      this.$ajax.put('api/mix/dependence', {
        'jsonContent': JSON.stringify(JSON.parse(this.myDiagram.model.toJson())),
        'dependentGoal': this.newGoals[1],
        'dependenceJson': JSON.stringify(jsonObj)
      })
        .then((response) => {
          console.log(response)
          const code = response.data.code
          if (code === 1) {
            let depkey = response.data.data
            depkey = depkey + '_cy'
            this.identifyRedBox(depkey)
            let roleKey = this.myDiagram.findNodeForKey(depkey).data.group
            this.depo = this.myDiagram.findNodeForKey(roleKey).data.Name
            roleKey = this.myDiagram.findNodeForKey(this.newGoals[1]).data.group
            this.deps = this.myDiagram.findNodeForKey(roleKey).data.Name
            this.isDisable1 = true
            this.isDisable2 = true
            this.isDis3 = true
            this.isDis4 = false
          }
        })
        .catch((error) => {
          alert('识别失败，请重试')
          console.log(error)
        })
    },
    findGroupName (nodeKey, name) {
      let jsonObj = JSON.parse(this.myDiagram.model.toJson())
      let nodeArray = jsonObj.nodeDataArray
      let groupKey = ''
      for (let i = 0; i < nodeArray.length; i++) {
        if (nodeArray[i].key === nodeKey) {
          groupKey = nodeArray[i].group
          console.log('g', groupKey)
          break
        }
      }
      for (let i = 0; i < nodeArray.length; i++) {
        if (nodeArray[i].key === groupKey) {
          console.log(nodeArray[i].Name)
          name = nodeArray[i].Name
        }
      }
    },
    deleteColor (keys) {
      let jsonObj = JSON.parse(this.myDiagram.model.toJson())
      let nodeArray = jsonObj.nodeDataArray
      for (let i = 0; i < nodeArray.length; i++) {
        if (keys.includes(nodeArray[i].key + '')) {
          if ((nodeArray[i].stroke === 'red') || (nodeArray[i].stroke === 'yellow')) {
            nodeArray[i].strokeWidth = 2
            nodeArray[i].strokeDashArray = null
            switch (nodeArray[i].Type) {
              case '<<功能性目标>>':
                nodeArray[i].stroke = '#2E8B57'
                break
              case '<<非功能性目标>>':
                nodeArray[i].stroke = 'rgb(184,188,164)'
                break
              case '<<可操作性目标>>':
                nodeArray[i].stroke = '#8FBC8F'
                break
              case '<<资源>>':
                nodeArray[i].stroke = '#CDB7B5'
                break
              case '<<角色>>':
                nodeArray[i].stroke = '#CDAA7D'
                break
              case '<<角色作用域>>':
                nodeArray[i].stroke = 'gray'
                break
              case '<<约束>>':
                nodeArray[i].stroke = 'gray'
                break
            }
          }
        }
      }
      this.imageData = this.myDiagram.makeImageData({background: '#DAE4EE'})
      this.myDiagram.model = go.Model.fromJson(JSON.stringify(jsonObj))
      this.loadDiagramProperties()
    },
    copyNodesLinks (keys) {
      let jsonObj = JSON.parse(this.myDiagram.model.toJson())
      let nodeArray = jsonObj.nodeDataArray
      let copyNodeArray = []
      let linkArray = jsonObj.linkDataArray
      let copyLinkArray = []
      for (let i = 0; i < nodeArray.length; i++) {
        if (keys.includes(nodeArray[i].key)) {
          copyNodeArray.push(JSON.parse(JSON.stringify(nodeArray[i])))
        }
      }
      for (let i = 0; i < linkArray.length; i++) {
        if (keys.includes(linkArray[i].from) && keys.includes(linkArray[i].to)) {
          copyLinkArray.push(JSON.parse(JSON.stringify(linkArray[i])))
        }
      }
      let leftPointest = 1500.0
      let upPointest = 1500.0
      for (let p = 0; p < nodeArray.length; p++) {
        if (nodeArray[p].loc !== undefined) {
          let location = nodeArray[p].loc.split(' ')
          let x = parseFloat(location[0])
          if (x < leftPointest) {
            leftPointest = x + 0.0
          }
          let y = parseFloat(location[1])
          if (y < upPointest) {
            upPointest = y + 0.0
          }
        }
      }
      // let copyHeigh = 0.0
      let copyleft = 0.0
      let copyRight = 0.0
      let copyUp = 1500.0
      let copyDown = -1500.0
      for (let i = 0; i < copyNodeArray.length; i++) {
        if (copyNodeArray[i].loc !== undefined) {
          let location = copyNodeArray[i].loc.split(' ')
          let x = parseFloat(location[0])
          if (x < copyleft) {
            copyleft = x + 0.0
          }
          if (x > copyRight) {
            copyRight = x + 0.0
          }
          let y = parseFloat(location[1])
          if (y < copyUp) {
            copyUp = y + 0.0
          }
          if (y > copyDown) {
            copyDown = y + 0.0
          }
        }
      }
      let moveXLength = copyRight - this.splitLineLocX + 150.0
      let moveYLength = copyDown - upPointest + 150.0
      for (let i = 0; i < copyNodeArray.length; i++) {
        copyNodeArray[i].key = copyNodeArray[i].key + '_cy'
        if ((copyNodeArray[i].group !== undefined)) {
          if (keys.includes(copyNodeArray[i].group)) {
            copyNodeArray[i].group = copyNodeArray[i].group + '_cy'
          } else {
            copyNodeArray[i].group = ''
          }
        }
        if (copyNodeArray[i].loc !== undefined) {
          let location = copyNodeArray[i].loc.split(' ')
          let x = parseFloat(location[0]) - moveXLength
          let y = parseFloat(location[1]) - moveYLength
          copyNodeArray[i].loc = x.toString() + ' ' + y.toString()
          // nodeArray[i].loc
        }
        if ((copyNodeArray[i].stroke === 'red') || (copyNodeArray[i].stroke === 'yellow')) {
          copyNodeArray[i].strokeWidth = 2
          copyNodeArray[i].strokeDashArray = null
          switch (copyNodeArray[i].Type) {
            case '<<功能性目标>>':
              copyNodeArray[i].stroke = '#2E8B57'
              break
            case '<<非功能性目标>>':
              copyNodeArray[i].stroke = 'rgb(184,188,164)'
              break
            case '<<可操作性目标>>':
              copyNodeArray[i].stroke = '#8FBC8F'
              break
            case '<<资源>>':
              copyNodeArray[i].stroke = '#CDB7B5'
              break
            case '<<角色>>':
              copyNodeArray[i].stroke = '#CDAA7D'
              break
            case '<<角色作用域>>':
              copyNodeArray[i].stroke = 'gray'
              break
            case '<<约束>>':
              copyNodeArray[i].stroke = 'gray'
              break
          }
        }
        nodeArray.push(copyNodeArray[i])
      }
      for (let j = 0; j < copyLinkArray.length; j++) {
        copyLinkArray[j].to = copyLinkArray[j].to + '_cy'
        copyLinkArray[j].from = copyLinkArray[j].from + '_cy'
        let pointSet = copyLinkArray[j].points
        for (let p = 0; p < pointSet.length; p++) {
          pointSet[p] = pointSet[p] - moveXLength
          p++
          pointSet[p] = pointSet[p] - moveYLength
        }
        copyLinkArray[j].points = pointSet
        linkArray.push(copyLinkArray[j])
      }
      this.imageData = this.myDiagram.makeImageData({background: '#DAE4EE'})
      this.myDiagram.model = go.Model.fromJson(JSON.stringify(jsonObj))
      this.loadDiagramProperties()
    },
    fourthStep () {
      this.isDisable1 = false
      this.isDisable2 = true
      this.isDis4 = true
    },
    getMainModel () {
      // 获取主模型
      let AjsonObj = JSON.parse(this.myDiagram.model.toJson())
      let alinkArray = AjsonObj.linkDataArray.concat()
      let anodeArray = AjsonObj.nodeDataArray.concat()
      let linkArray = []
      let nodeArray = []
      let target = '_sub'
      for (let i = 0; i < anodeArray.length; i++) {
        let key = anodeArray[i].key + ''
        let start = key.length - target.length
        let arr = key.substr(start, target.length)
        if (arr === target) {
          continue
        }
        nodeArray.push(anodeArray[i])
      }
      for (let i = 0; i < alinkArray.length; i++) {
        let from = alinkArray[i].from + ''
        let start = from.length - target.length
        let arr = from.substr(start, target.length)
        if (arr === target) {
          continue
        }
        if (alinkArray[i].Linktype === '虚线') {
          continue
        }
        linkArray.push(alinkArray[i])
      }
      AjsonObj.nodeDataArray = nodeArray.concat()
      AjsonObj.linkDataArray = linkArray.concat()
      return AjsonObj
    },
    preprocess () {
      this.deleteModelColor()
      // 获取主模型
      let AjsonObj = JSON.parse(this.myDiagram.model.toJson())
      let alinkArray = AjsonObj.linkDataArray.concat()
      let anodeArray = AjsonObj.nodeDataArray.concat()
      let linkArray = []
      let nodeArray = []
      let target = '_sub'
      for (let i = 0; i < anodeArray.length; i++) {
        let key = anodeArray[i].key + ''
        let start = key.length - target.length
        let arr = key.substr(start, target.length)
        if (arr === target) {
          continue
        }
        nodeArray.push(anodeArray[i])
      }
      for (let i = 0; i < alinkArray.length; i++) {
        let from = alinkArray[i].from + ''
        let start = from.length - target.length
        let arr = from.substr(start, target.length)
        if (arr === target) {
          continue
        }
        if (alinkArray[i].Linktype === '虚线') {
          continue
        }
        linkArray.push(alinkArray[i])
      }
      AjsonObj.nodeDataArray = nodeArray.concat()
      AjsonObj.linkDataArray = linkArray.concat()
      this.$ajax.put('api/mix/preprocess', {
        'jsonContent': JSON.stringify(AjsonObj)
      })
        .then((response) => {
          console.log(response)
          const code = response.data.code
          if (code === 1) {
            let jsonContent = JSON.parse(response.data.data)
            let isomerousArray = jsonContent.isomerousArray
            if (isomerousArray.length === 0) {
            } else {
              this.processItems = jsonContent.isomerousArray
              let keys = []
              for (let i = 0; i < isomerousArray.length; i++) {
                keys.push(isomerousArray[i].goal_1)
                keys.push(isomerousArray[i].goal_2)
              }
              this.identifyRedBox(keys)
            }
            this.toggle2 = true
            this.isDisable1 = true
            this.isDisable2 = false
          }
        })
        .catch((error) => {
          alert('识别失败，请重试')
          console.log(error)
        })
      // this.isDisable1 = true
      // this.isDisable2 = false
    },
    checkInconsistency () {
      this.deleteModelColor()
      // 获取主模型
      let AjsonObj = JSON.parse(this.myDiagram.model.toJson())
      let alinkArray = AjsonObj.linkDataArray.concat()
      let anodeArray = AjsonObj.nodeDataArray.concat()
      let linkArray = []
      let nodeArray = []
      let target = '_sub'
      for (let i = 0; i < anodeArray.length; i++) {
        let key = anodeArray[i].key + ''
        let start = key.length - target.length
        let arr = key.substr(start, target.length)
        if (arr === target) {
          continue
        }
        nodeArray.push(anodeArray[i])
      }
      for (let i = 0; i < alinkArray.length; i++) {
        let from = alinkArray[i].from + ''
        let start = from.length - target.length
        let arr = from.substr(start, target.length)
        if (arr === target) {
          continue
        }
        if (alinkArray[i].Linktype === '虚线') {
          continue
        }
        linkArray.push(alinkArray[i])
      }
      AjsonObj.nodeDataArray = nodeArray.concat()
      AjsonObj.linkDataArray = linkArray.concat()
      this.$ajax.put('api/mix/inconsistency', {
        'jsonContent': JSON.stringify(AjsonObj)
      })
        .then((response) => {
          console.log(response)
          const code = response.data.code
          if (code === 1) {
            let jsonContent = JSON.parse(response.data.data)
            let conflictArray = jsonContent.conflictArray
            if (conflictArray.length === 0) {
            } else {
              this.items = jsonContent.conflictArray
              let keys = []

              for (let i = 0; i < conflictArray.length; i++) {
                keys.push(conflictArray[i].goal_1)
                keys.push(conflictArray[i].goal_2)
              }
              this.identifyRedBox(keys)
            }
            this.toggle1 = true
            this.isDisable1 = true
            this.isDisable2 = true
            this.isDis4 = true
            this.isDis5 = false
          }
        })
        .catch((error) => {
          alert('识别失败，请重试')
          console.log(error)
        })
      // let keys = []
      // keys.push('-38')
      // keys.push('-51')
      // keys.push('-16_sub')
      // keys.push('-27_sub')
      // keys.push('-17_sub')
      // keys.push('-18_sub')
      // keys.push('-19_sub')
      // keys.push('-23_sub')
      // this.deleteColor(keys)
      // let wrongKeys = []
      // wrongKeys.push('-41')
      // wrongKeys.push('-11_sub_cy')
      // wrongKeys.push('-42')
      // wrongKeys.push('-25_sub_cy')
      // // wrongKeys.push('-19_sub_cy')
      // // wrongKeys.push('-23_sub_cy')
      // this.identifyRedBox(wrongKeys)
      // wrongKeys = []
      // wrongKeys.push('-39')
      // wrongKeys.push('-2_sub_cy')
      // this.identifyRedBox(wrongKeys, 'yellow')
      // this.isDis4 = true
      // this.isDis5 = false
    },
    deleteModelColor (part) {
      let AjsonObj = JSON.parse(this.myDiagram.model.toJson())
      let anodeArray = AjsonObj.nodeDataArray.concat()
      let target = '_sub'
      // 去除红框
      for (let i = 0; i < anodeArray.length; i++) {
        if ((anodeArray[i].stroke === 'red') || (anodeArray[i].stroke === 'yellow')) {
          if (part === 'sub') {
            let key = anodeArray[i].key + ''
            let start = key.length - target.length
            let arr = key.substr(start, target.length)
            if (arr !== target) {
              continue
            }
          }
          anodeArray[i].strokeWidth = 2
          anodeArray[i].strokeDashArray = null
          switch (anodeArray[i].Type) {
            case '<<功能性目标>>':
              anodeArray[i].stroke = '#2E8B57'
              break
            case '<<非功能性目标>>':
              anodeArray[i].stroke = 'rgb(184,188,164)'
              break
            case '<<可操作性目标>>':
              anodeArray[i].stroke = '#8FBC8F'
              break
            case '<<资源>>':
              anodeArray[i].stroke = '#CDB7B5'
              break
            case '<<角色>>':
              anodeArray[i].stroke = '#CDAA7D'
              break
            case '<<角色作用域>>':
              anodeArray[i].stroke = 'gray'
              break
            case '<<约束>>':
              anodeArray[i].stroke = 'gray'
              break
          }
        }
      }
      AjsonObj.nodeDataArray = anodeArray.concat()
      // 将模型展示在画板中
      this.imageData = this.myDiagram.makeImageData({background: '#DAE4EE'})
      this.myDiagram.model = go.Model.fromJson(JSON.stringify(AjsonObj))
      this.loadDiagramProperties()
    },
    deleteSubModel () {
      let wrongKeys = []
      wrongKeys.push('-38')
      wrongKeys.push('-1_sub_cy')
      wrongKeys.push('-51')
      wrongKeys.push('-16_sub_cy')
      this.deleteColor(wrongKeys)
      let AjsonObj = JSON.parse(this.myDiagram.model.toJson())
      let alinkArray = AjsonObj.linkDataArray.concat()
      let anodeArray = AjsonObj.nodeDataArray.concat()
      let linkArray = []
      let nodeArray = []
      let target = '_sub'
      for (let i = 0; i < anodeArray.length; i++) {
        let key = anodeArray[i].key + ''
        let start = key.length - target.length
        let arr = key.substr(start, target.length)
        if (arr === target) {
          continue
        }
        // if (key.indexOf('_sub') !== -1) {
        //
        // }
        nodeArray.push(anodeArray[i])
      }
      for (let i = 0; i < alinkArray.length; i++) {
        let from = alinkArray[i].from + ''
        let start = from.length - target.length
        let arr = from.substr(start, target.length)
        if (arr === target) {
          continue
        }
        // if (from.indexOf('_sub') !== -1) {
        //   continue
        // }
        if (alinkArray[i].Linktype === '虚线') {
          continue
        }
        linkArray.push(alinkArray[i])
      }
      // 去除红框
      for (let i = 0; i < nodeArray.length; i++) {
        if (nodeArray[i].stroke === 'red') {
          nodeArray[i].strokeWidth = 2
          nodeArray[i].strokeDashArray = null
          switch (nodeArray[i].Type) {
            case '<<功能性目标>>':
              nodeArray[i].stroke = '#2E8B57'
              break
            case '<<非功能性目标>>':
              nodeArray[i].stroke = 'rgb(184,188,164)'
              break
            case '<<可操作性目标>>':
              nodeArray[i].stroke = '#8FBC8F'
              break
            case '<<资源>>':
              nodeArray[i].stroke = '#CDB7B5'
              break
            case '<<角色>>':
              nodeArray[i].stroke = '#CDAA7D'
              break
            case '<<角色作用域>>':
              nodeArray[i].stroke = 'gray'
              break
            case '<<约束>>':
              nodeArray[i].stroke = 'gray'
              break
          }
        }
      }
      AjsonObj.nodeDataArray = nodeArray.concat()
      AjsonObj.linkDataArray = linkArray.concat()
      this.isMixed = false
      this.isSubShow = false
      // 将模型展示在画板中
      this.imageData = this.myDiagram.makeImageData({background: '#DAE4EE'})
      this.myDiagram.model = go.Model.fromJson(JSON.stringify(AjsonObj))
      this.loadDiagramProperties()
      this.isDisable1 = true
      this.isDis1 = false
      this.isDis5 = true
      this.splitLine = 0.0
      this.splitLineLocX = 0.0
      this.toggle2 = false
      this.toggle3 = false
      this.toggle1 = false
      this.toggle = false
      this.deps = ''
      this.depo = ''
      this.newGoals = []
      this.yellowGoals = []
      this.processItems = [{ id: 'null', type: 'null', name_1: 'null', name_2: 'null', solution: 'null' }]
      this.items = [{ id: 'null', type: 'null', name_1: 'null', name_2: 'null', solution: 'null' }]
    },
    loadFile (files) {
      if (this.imFile) {
        let name = this.imFile.name
        let reader = new FileReader()
        reader.onload = () => {
          if (name.indexOf('.xml') !== (-1)) {
            this.load(this.XML2Json(reader.result))
          } else if (name.indexOf('.json') !== (-1)) {
            this.load(reader.result)
          }
        }
        reader.readAsText(this.imFile)
      }
    },

    doSave (value, type, name) {
      let blob
      if (typeof window.Blob === 'function') {
        blob = new Blob([value], {type: type})
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

    diagramAnalysis () {
      // TODO:显示
      this.roleAnalysis = ''
      let connectedNodes
      for (let v of this.myDiagram.model.nodeDataArray) {
        // eslint-disable-next-line one-var
        let role, goal = [], constraint = []
        if (v.Type === '<<角色>>') {
          role = v.Name
          v = this.myDiagram.findNodeForKey(v.key)
          connectedNodes = v.findNodesConnected().iterator
          while (connectedNodes.next()) {
            if (connectedNodes.value.data.Type === '<<目标>>') {
              goal.push(connectedNodes.value.data.Name)
            }
          }
          for (let node of this.myDiagram.model.nodeDataArray) {
            if (node.Type === '<<约束>>') {
              constraint.push(node.Name)
            }
          }
          goal = goal.filter(function (value) {
            return value
          })
          constraint = constraint.filter(function (value) {
            return value
          })
          let tip = `<tr><td>${role}</td><td></td><td>${goal.join(',')}</td><td>${constraint.join(',')}</td></tr>`
          this.roleAnalysis = this.roleAnalysis + tip
        }
      }
    },
    diagramCheck () {
      this.errors = []
      this.myDiagram.startTransaction('set all properties')
      // eslint-disable-next-line one-var
      let toNode, fromNode, link, linkType, errorStr, adjustStr, errorFromNodes = [], errorToNodes = []
      let it = this.myDiagram.links
      let pattern = /^<<.+目标>>$/
      let type = this.diagram.diagramType
      for (let n of this.myDiagram.model.nodeDataArray) {
        this.myDiagram.model.setDataProperty(n, 'stroke', '#000000')
      }
      if (type === 'GN') {
        while (it.next()) {
          let bug = false
          link = it.value
          fromNode = link.fromNode.data
          toNode = link.toNode.data
          linkType = link.data.Linktype
          if (toNode.Type === '<<目标>>' && pattern.test(fromNode.Type)) {
            if (linkType !== 'AND' && linkType !== 'OR') {
              errorStr = `${fromNode.Type}与${toNode.Type}之间存在不合法的${linkType}关系`
              adjustStr = `${fromNode.Type}与${toNode.Type}之间合法的关系为AND、OR`
              bug = true
            }
          } else if (fromNode.Type === '<<目标>>' && toNode.Type === '<<目标>>') {
            if (linkType === 'AND' || linkType === 'OR') {
              errorStr = `${fromNode.Type}与${toNode.Type}之间存在不合法的${linkType}关系`
              adjustStr = `${fromNode.Type}与${toNode.Type}之间合法的关系为互斥、促进、阻碍、依赖`
              bug = true
            }
          } else if (fromNode.Type === '<<目标>>' && pattern.test(toNode.Type)) {
            errorStr = `${fromNode.Type}与${toNode.Type}之间存在不合法的${linkType}关系`
            adjustStr = `${fromNode.Type}与${toNode.Type}之间合法的关系为AND、OR`
            bug = true
          }
          if (bug) {
            errorFromNodes.push(fromNode)
            errorToNodes.push(toNode)
            this.errors.push([errorStr, adjustStr])
          }
        }
      } else if (type === 'SN') {
        while (it.next()) {
          link = it.value
          fromNode = link.fromNode.data
          toNode = link.toNode.data
          linkType = link.data.Linktype
          if (toNode.Type === '<<开始>>') {
            errorStr = `${toNode.Type}不可为关系指入端`
            adjustStr = `${toNode.Type}应作为关系指出端`
            errorFromNodes.push(fromNode)
            errorToNodes.push(toNode)
            this.errors.push([errorStr, adjustStr])
          }
          if (fromNode.Type === '<<结束>>') {
            errorStr = `${fromNode.Type}不可为关系指出端`
            adjustStr = `${fromNode.Type}应作为关系指入端`
            errorFromNodes.push(fromNode)
            errorToNodes.push(toNode)
            this.errors.push([errorStr, adjustStr])
          }
        }
        // eslint-disable-next-line one-var
        let s = [], e = [], choice = [], choiceEnd = [], split = [], join = []
        for (let n of this.myDiagram.model.nodeDataArray) {
          if (n.Type === '<<开始>>') {
            s.push(n)
          } else if (n.Type === '<<结束>>') {
            e.push(n)
          } else if (n.Type === '<<选择>>') {
            choice.push(n)
          } else if (n.Type === '<<选择结束>>') {
            choiceEnd.push(n)
          } else if (n.Type === '<<拆分>>') {
            split.push(n)
          } else if (n.Type === '<<合并>>') {
            join.push(n)
          }
        }
        if (s.length > 1) {
          errorStr = `开始节点数大于1`
          adjustStr = `开始节点数应为0或1`
          errorFromNodes.push(...s)
          this.errors.push([errorStr, adjustStr])
        }
        if (e.length > 1) {
          errorStr = `结束节点数大于1`
          adjustStr = `结束节点数应为0或1`
          errorToNodes.push(...e)
          this.errors.push([errorStr, adjustStr])
        }
        if (s.length <= 1 && e.length <= 1 && s.length !== e.length) {
          errorStr = `开始节点与结束节点不匹配`
          adjustStr = `开始节点应与结束节点匹配`
          errorFromNodes.push(...s)
          errorToNodes.push(...e)
          this.errors.push([errorStr, adjustStr])
        }
        if (choice.length !== choiceEnd.length) {
          errorStr = `选择节点与选择结束节点不匹配`
          adjustStr = `选择节点应与选择结束节点匹配`
          errorFromNodes.push(...s)
          errorToNodes.push(...e)
          this.errors.push([errorStr, adjustStr])
        }
        if (split.length !== join.length) {
          errorStr = `拆分节点与合并节点不匹配`
          adjustStr = `拆分节点应与合并节点匹配`
          errorFromNodes.push(...s)
          errorToNodes.push(...e)
          this.errors.push([errorStr, adjustStr])
        }
      }
      for (let n of errorFromNodes) {
        this.myDiagram.model.setDataProperty(n, 'stroke', '#ff0000')
      }
      for (let n of errorToNodes) {
        this.myDiagram.model.setDataProperty(n, 'stroke', '#ff0000')
      }
      this.myDiagram.commitTransaction('set all properties')
    },
    handleEditorDivider (e) {
      this.moveCanvasCenter()
      let mySelf = this
      document.onmousemove = function (e) {
        const globalX = document.body.scrollWidth
        let mouseX = e.clientX
        let md = Math.round(mouseX / (globalX / 12))
        if (md < 1)md = 1
        if (md > 11)md = 11
        mySelf.sideBarmd = md
        return false
      }
      document.onmouseup = function () {
        document.onmousemove = null
        document.onmouseup = null
      }
    },
    handleEditorDivider2 (e) {
      this.moveCanvasCenter()
      let mySelf = this
      document.onmousemove = function (e) {
        const globalX = document.body.scrollWidth
        let mouseX = e.clientX
        let md = Math.round(mouseX / (globalX / 12))
        if (md < 2)md = 2
        if (md > 10)md = 10
        mySelf.rightSideBar = 12 - md
        return false
      }
      document.onmouseup = function () {
        document.onmousemove = null
        document.onmouseup = null
      }
    },
    moveToFolder () {
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
    moveCanvasCenter () {
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
  .navbar{
    margin: 0 auto;
  }
  option {
    color: black !important;
  }
  #search-type{
    color: gray;
    margin-right: 9px;
  }
  #brand {
    line-height: 80px;
    font-weight: bold;
    padding: 0 15px;
    font-size: 24px;
    letter-spacing: -0.05em;
    color: #2c3e50;
  }
  #mixname {
    line-height: 80px;
    padding: 0 15px;
    font-size: 24px;
    letter-spacing: -0.05em;
    color: #2c3e50;
  }
  .sidebar-collapse{
    height: 100%;
    overflow-y:auto;
  }
  .verticalBar {
    width: 2px;
    height: 29px;
    background: red;
    display: inline-block;
    margin-top: 31px;
    vertical-align: top;
    margin-right: 29px;
    margin-left: 30px;
  }
  .top-bar{
    min-height: 40px;
    margin: 0px;
    padding: 0px;
  }
  .sidebar-collapse > .nav{
    height: 100%;
    max-height: 800px;
    margin-left: -15px;
    padding-left: 15px;
    background-color: #eee;
    border-right:1px solid #D2D2D2;
    padding-top:10px;
    overflow-y: scroll;
    overflow-x: hidden;
  }
  ul.collapse{
    border-top: 1px solid #D2D2D2;
    border-bottom: 1px solid #D2D2D2;
  }
  .sidebar-collapse > .nav > li{
    border-bottom: 1px solid #D2D2D2;
  }
  div > ul > li:nth-child(2) > a{
    padding-bottom: 3px;
    padding-top: 3px;
  }
  div > ul > li:nth-child(3) > a{
       padding-bottom: 3px;
       padding-top: 3px;
  }
  #myPaletteDiv {
    width: 100%;
    height: 100%;
    display: inline-block;
  }
  ::-webkit-scrollbar{
    width: 5px;/* 纵向滚动条*/
    height: 5px;/* 横向滚动条 */
    background-color: #fff;
  }

  /*定义滚动条轨道 内阴影*/
  ::-webkit-scrollbar-track{
    -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0);
    background-color: #fff;
  }

  /*定义滑块 内阴影*/
  ::-webkit-scrollbar-thumb{
    -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0);
    background-color: #D5D5D5;
  }

  .hidemapbox{
    display: none;
    position: absolute;
    top: 36px;
    z-index: 999;
    width: 100%;
    background: #cccccc;
  }
  .hidemapbox.active{
    display: block;
  }
</style>
