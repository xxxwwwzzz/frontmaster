<template>
  <div class='item _2fd8twDco3d8QZvnSUuJke'>
    <b-modal :id="'foldermodal'+num" :title="folder.folderName" size="xl" ok-only no-stacking>
      <div class="list-body">
        <div class="list-header">
          <div class="header-actions">
            <b-button id="sort" variant="outline-primary" @click="sortByTime"><i class="fas fa-sort-amount-up"></i>{{$t('diagramContainer.sort-by-time')}}
            </b-button>
            <b-button id="overview" variant="outline-primary" @click="routeTo"><i class="fas fa-chart-pie"></i>{{$t('folderView.open-overview-diagram')}}
          </b-button>
            <b-dropdown :text="$t('folderView.fuse-model')" split split-variant="outline-primary" variant="primary"  class="m-2" >
              <b-dropdown-item href="#" v-b-modal="'mix-goalmodal'" @click="clearOlderDatas">
                <i class="fas fa-star"></i>{{$t('folderView.fuse-goal-model')}}
              </b-dropdown-item>
              <b-dropdown-item href="#" v-b-modal="'mix-bpmnmodal'" @click="clearOlderDatas2">
                <i class="fas fa-map"></i>{{$t('folderView.fuse-bus-model')}}
              </b-dropdown-item>
            </b-dropdown>
            <b-button id="regular" variant="sucess" v-b-modal="'create-modall'+num"><i class="fas fa-plus-circle"></i>{{$t('diagramContainer.creat-modal')}}
          </b-button>
<!--            <b-button id="mixGoal" variant="sucess" v-b-modal="'mix-goalmodal'" @click="clearOlderDatas"><i class="fas fa-star"></i>融合目标模型-->
<!--            </b-button>-->
          </div>
        </div>
        <section class="list-content">
          <diagram-view v-for="(diagram,index) in diagrams" :key="index" :diagram="diagram"></diagram-view>
          <div class="itemempty"></div>
<!--          <div class=""  :id="viewid">-->
<!--            <svg></svg>-->
<!--          </div>-->
          <div class="itemempty"></div>
          <div class="itemempty"></div>
          <div class="itemempty"></div>
          <div class="itemempty"></div>
          <div class="itemempty"></div>
          <div class="itemempty"></div>
        </section>
<!--        <knowledge-view  :nodes="nodes" :edges="edges"></knowledge-view>-->
      </div>
    </b-modal>
    <b-modal :id="'create-modall'+num" :title="$t('createModal.creat-model')" @ok="createDiagram">
      <b-form>
        <b-form-group :label="$t('createModal.model-name')">
          <b-form-input v-model="inputName"></b-form-input>
        </b-form-group>
        <b-form-group :label="$t('createModal.model-type')">
          <b-form-radio v-model="selectedType" name="diagramType" value="VN">{{$t('createModal.value-model')}}</b-form-radio>
          <b-form-radio v-model="selectedType" name="diagramType" value="GN">{{$t('createModal.goal-model')}}</b-form-radio>
          <!--          <b-form-radio v-model="selectedType" name="diagramType" value="SN">服务网络模型</b-form-radio>-->
          <b-form-radio v-model="selectedType" name="diagramType" value="BPMN">{{$t('createModal.business-model')}}</b-form-radio>
        </b-form-group>
      </b-form>
    </b-modal>
<!--    <b-button v-b-modal.mix-goalmodall>Open First Modal</b-button>-->

    <b-modal id="mix-goalmodal" size="lg" title="融合目标模型"    hide-footer   >
      <b-form  >
        <b-form-group label="当前领域目标模型">
<!--          <b-form-file v-model="goalfileA" multiple :file-name-formatter="formatNames" accept=".json"></b-form-file>-->
          <b-form-file v-model="goalfileA" accept=".json" ></b-form-file>
        </b-form-group>
        <b-form-group label="待融合领域目标模型">
          <b-form-file v-model="goalfileB"  accept=".json"></b-form-file>
        </b-form-group>
<!--              <b-button  variant="primary" @click="mixGoalDiagram">Submit</b-button>-->
      </b-form>
      <b-row>
        <b-col lg="6"><b-button  variant="primary"  block  @click="uploadFiles">导入</b-button></b-col>
      <b-col lg="6"><b-button variant="primary" v-b-modal.modal-multi-2 block v-bind:disabled="!showGoalResult">查看结果</b-button></b-col>
      </b-row>
    </b-modal>
    <b-modal id="mix-bpmnmodal" size="lg" title="融合业务模型"    hide-footer   >
      <b-form  >
        <b-form-group label="当前领域业务模型">
          <!--          <b-form-file v-model="goalfileA" multiple :file-name-formatter="formatNames" accept=".json"></b-form-file>-->
          <b-form-file v-model="bpmnfileA" accept=".xml" ></b-form-file>
        </b-form-group>
        <b-form-group label="待融合领域业务模型">
          <b-form-file v-model="bpmnfileB"  accept=".xml"></b-form-file>
        </b-form-group>
        <!--              <b-button  variant="primary" @click="mixGoalDiagram">Submit</b-button>-->
      </b-form>
      <b-row>
        <b-col lg="6"><b-button  variant="primary"  block  @click="uploadBPMNFiles">导入</b-button></b-col>
        <b-col lg="6"><b-button variant="primary" v-b-modal.modal-multi-2 block v-bind:disabled="!showBpmnResult">查看结果</b-button></b-col>
      </b-row>
    </b-modal>
    <b-modal id="modal-multi-2" title="融合目标模型" size="xl"  style="width: 1200px;" >
<!--      <p class="my-2">请依次查看：</p>-->
<!--      <b-row>-->
<!--        <b-col lg="9"><p class="my-2">步骤一：融合用户目标</p></b-col>-->
<!--        <b-col lg="3" >-->
<!--          <b-button variant="primary" block v-b-modal.modal-multi-3>查看</b-button>-->
<!--        </b-col>-->
<!--      </b-row>-->
<!--      <b-row>-->
<!--        <b-col lg="9"><p class="my-2">步骤二：融合被依赖方目标</p></b-col>-->
<!--        <b-col lg="3" >-->
<!--          <b-button variant="primary" block v-b-modal.modal-multi-4>查看</b-button>-->
<!--        </b-col>-->
<!--      </b-row>-->
<!--      <b-row>-->
<!--        <b-col lg="9"><p class="my-2">步骤三：检测不一致性</p></b-col>-->
<!--        <b-col lg="3" >-->
<!--          <b-button variant="primary" block v-b-modal.modal-multi-5>查看</b-button>-->
<!--        </b-col>-->
<!--      </b-row>-->
      <b-card no-body class="overflow-hidden">

            <b-card-body title="目标融合结果">
              <b-card-img :src="imageData1" alt="Image" top></b-card-img>
              <b-card-text >
                <h4>过程简介</h4>
                <div  v-html="processContent" style="white-space: pre-wrap;"></div>
              </b-card-text>
            </b-card-body>
        <b-row>
          <b-col lg="12">
            <b-dropdown text="      下载      "  variant="primary"  class="m-2" block style="width: 98%;">
              <b-dropdown-item href="#" @click="downs1">PNG图片</b-dropdown-item>
              <b-dropdown-item href="#" @click="downXml">XML文件</b-dropdown-item>
            </b-dropdown>
          </b-col>
        </b-row>
<!--        <b-row>-->
<!--          <b-col lg="6"><b-button href="#" variant="primary" block @click="downs1">下载图片</b-button></b-col>-->
<!--          <b-col lg="6"><b-button href="#" variant="primary" block @click="downXml">下载XML</b-button></b-col>-->
<!--        </b-row>-->
      </b-card>
    </b-modal>

<!--    <b-modal id="modal-multi-3"  title="融合用户目标" ok-only size="xl" style="width: 1200px;">-->
<!--&lt;!&ndash;      <p class="my-1">步骤一:融合用户目标</p>&ndash;&gt;-->
<!--      <b-card >-->
<!--        <b-card-body title="步骤一:融合用户目标">-->
<!--          <b-card-text>1.寻找Da用户未满足新目标</b-card-text>-->
<!--          <b-card-text>2.寻找Db用户可满足的解决方案</b-card-text>-->
<!--          <b-card-text>3.融合用户目标</b-card-text>-->
<!--        </b-card-body>-->
<!--        <img :src="imageData1" >-->
<!--        <b-button href="#" variant="primary" block @click="downs1">下载</b-button>-->
<!--      </b-card>-->
<!--    </b-modal>-->
<!--    <b-modal id="modal-multi-4"  title="融合用户目标" ok-only size="xl" style="width: 1200px;">-->
<!--      <b-card >-->
<!--          <b-card-body title="步骤二:重定义目标依赖关系">-->
<!--            <b-card-text>1.检测用户的依赖角色</b-card-text>-->
<!--            <b-card-text>2.添加依赖角色</b-card-text>-->
<!--            <b-card-text>3.重新定义依赖关系</b-card-text>-->
<!--            <b-card-text>4.产生新目标</b-card-text>-->
<!--&lt;!&ndash;            <b-card-text>5.定义新资源依赖</b-card-text>&ndash;&gt;-->
<!--          </b-card-body>-->
<!--        <img :src="imageData2" >-->
<!--        <b-button href="#" variant="primary" block @click="downs2">下载</b-button>-->
<!--      </b-card>-->
<!--    </b-modal>-->
<!--    <b-modal id="modal-multi-5"  title="融合用户目标" ok-only size="xl" style="width: 1200px;">-->
<!--      <b-card >-->
<!--        <b-card-body title="步骤三:检测不一致性">-->
<!--          <b-card-text>1.软目标不一致性检测</b-card-text>-->
<!--        <b-card-text>2.可操作性目标不一致性检测</b-card-text>-->
<!--        <b-card-text>3.资源不一致性检测</b-card-text>-->
<!--        </b-card-body>-->
<!--        <img :src="imageData3" >-->
<!--        <b-button href="#" variant="primary" block @click="downs3">下载</b-button>-->
<!--      </b-card>-->
<!--    </b-modal>-->
<!--    <b-modal :id="'mix-goalmodall'" title="融合目标模型" >-->
<!--      <b-form v-if="chooseFile">-->
<!--        <b-form-group label="选择目标模型主文件Aa">-->
<!--          <b-form-file v-model="goalfileA" multiple :file-name-formatter="formatNames"></b-form-file>-->
<!--        </b-form-group>-->
<!--        <b-form-group label="选择目标模型辅文件Bb">-->
<!--          <b-form-file v-model="goalfileB" multiple :file-name-formatter="formatNames"></b-form-file>-->
<!--        </b-form-group>-->
<!--        <b-button  variant="primary" @click="mixGoalDiagram">Submit</b-button>-->
<!--      </b-form>-->
<!--    </b-modal>-->
    <div class='card'>
      <div class='card-info'>
        <h3>{{folder.folderName}}</h3>
        <div class='time'>{{folder.createTime}}</div>
      </div>
      <ul class='social'>
        <li><a href="" :data-tip="$t('folderView.delete')" @click="deleteFolder">
          <i class='fas fa-trash-alt'></i></a></li>
        <li><a href="#" :data-tip="$t('folderView.open-folder')" v-b-modal="'foldermodal'+num">
          <i class='fas fa-sign-in-alt'></i></a></li>
      </ul>
    </div>
  </div>
</template>

<script>
import DiagramView from './diagramView'
import { XML } from '../../workspace/components/ObjTree.js'

export default {
  name: 'folderView',
  props: {
    folder: {
      type: Object,
      default: null
    },
    num: {
      type: Number
    }
  },
  data () {
    return {
      processContent: '步骤一：融合用户目标\n\t1.寻找Da用户未满足新目标\n\t2.寻找Db用户可满足的解决方案\n\t3.融合用户目标' +
        '\n步骤二：融合被依赖方目标\n\t1.检测用户的依赖角色\n\t2.添加依赖角色\n\t3.重新定义依赖关系\n\t4.产生新目标' +
        '\n步骤三：检测不一致性\n\t1.软目标不一致性检测\n\t2.可操作性目标不一致性检测\n\t3.资源不一致性检测',
      showGoalResult: false,
      showBpmnResult: false,
      imageData1: '',
      xmlContentGoal: '',
      imageData2: '',
      imageData3: '',
      chooseFile: true,
      goalfileA: null,
      goalfileB: null,
      jsonfileA: '',
      jsonfileB: '',
      bpmnfileA: null,
      bpmnfileB: null,
      xmlfileA: '',
      xmlfileB: '',
      diagrams: [],
      diagram: '',
      diagramIDs: [],
      diagramTypes: [],
      diagramNames: [],
      jsonText: '',
      nodes: [],
      curNodes: [],
      edges: [],
      viewid: '',
      selectedType: '',
      inputName: ''
    }
  },
  computed: {
    listenChangexmlA () {
      const {bpmnfileA} = this
      return {bpmnfileA}
    },
    listenChangexmlB () {
      const {bpmnfileB} = this
      return {bpmnfileB}
    },
    listenChangeA () {
      const {goalfileA} = this
      return {goalfileA}
    },
    listenChangeB () {
      const {goalfileB} = this
      return {goalfileB}
    },
    listenChangeInputGoal () {
      const {showGoalResult} = this
      return {showResult: showGoalResult}
    },
    listenChangeInputBPMN () {
      const {showBpmnResult} = this
      return {showResult: showBpmnResult}
    }
  },
  watch: {
    listenChangexmlA: {
      handler: function (newval, oldval) {
        let reader = new FileReader()
        let myself = this
        let name = myself.bpmnfileA.name
        reader.onload = () => {
          if (name.indexOf('.xml') !== (-1)) {
            myself.xmlfileA = reader.result
          }
          // console.log('111', myself.jsonfileA)
        }
        reader.readAsText(myself.bpmnfileA)
      }},
    listenChangexmlB: {
      handler: function (newval, oldval) {
        let reader = new FileReader()
        let myself = this
        let name = myself.bpmnfileB.name
        reader.onload = () => {
          if (name.indexOf('.xml') !== (-1)) {
            myself.xmlfileB = reader.result
          }
          // console.log('111', myself.jsonfileB)
        }
        reader.readAsText(myself.bpmnfileB)
      }},
    listenChangeA: {
      handler: function (newval, oldval) {
        let reader = new FileReader()
        let myself = this
        let name = myself.goalfileA.name
        reader.onload = () => {
          if (name.indexOf('.json') !== (-1)) {
            myself.jsonfileA = reader.result
          }
          // console.log('111', myself.jsonfileA)
        }
        reader.readAsText(myself.goalfileA)
      }},
    listenChangeB: {
      handler: function (newval, oldval) {
        let reader = new FileReader()
        let myself = this
        let name = myself.goalfileB.name
        reader.onload = () => {
          if (name.indexOf('.json') !== (-1)) {
            myself.jsonfileB = reader.result
          }
          // console.log('111', myself.jsonfileB)
        }
        reader.readAsText(myself.goalfileB)
      }},
    listenChangeInputGoal: {
      handler: function (newval, oldval) {
      }},
    listenChangeInputBPMN: {
      handler: function (newval, oldval) {
      }},
    nodes: function (val) {
      this.curNodes = this.nodes()
    }
  },
  mounted () {
    this.diagrams = this.folder.diagrams
  },
  components: {
    DiagramView
    // KnowledgeView
  },
  methods: {
    clickImg (e) {
      this.showImg = true
      // 获取当前图片地址
      this.imgSrc = e.currentTarget.src
    },
    viewImg () {
      this.showImg = false
    },
    clearOlderDatas () {
      this.goalfileA = null
      this.goalfileB = null
      this.showGoalResult = false
    },
    clearOlderDatas2 () {
      this.bpmnfileA = null
      this.bpmnfileB = null
      this.showBpmnResult = false
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
    uploadFiles () {
      if ((this.goalfileA !== null) && (this.goalfileB !== null)) {
        this.$ajax.put('api/folder', {
          'fileA': JSON.stringify(this.jsonfileA),
          'fileB': JSON.stringify(this.jsonfileB)
        })
          .then((response) => {
            console.log(response)
            const code = response.data.code
            if (code === 1) {
              this.imageData1 = 'data:image/png;base64,' + response.data.data[0]
              this.xmlContentGoal = JSON.parse(JSON.stringify(response.data.data[1]))
              // this.imageData2 = 'data:image/png;base64,' + response.data.data[1]
              // this.imageData3 = 'data:image/png;base64,' + response.data.data[1]
              console.log(this.imageData1)
              console.log(this.xmlContentGoal)
              this.showGoalResult = true
              alert('导入成功')
            }
          })
          .catch((error) => {
            this.showGoalResult = false
            alert('导入失败，请重试')
            console.log(error)
          })
      }
    },
    uploadBPMNFiles () {
      if ((this.bpmnfileA !== null) && (this.bpmnfileB !== null)) {
        this.$ajax.put('api/folder/result', {
          'fileXMLA': JSON.stringify(this.xmlfileA),
          'fileXMLB': JSON.stringify(this.xmlfileB)
        })
          .then((response) => {
            console.log(response)
            const code = response.data.code
            if (code === 1) {
              console.log('YES')
              this.showGoalResult = true
              alert('导入成功')
            }
          })
          .catch((error) => {
            this.showGoalResult = false
            alert('导入失败，请重试')
            console.log(error)
          })
      }
    },
    downs1 () {
      // 必须同源才能下载
      var alink = document.createElement('a')
      alink.href = this.imageData1
      alink.download = 'picture' // 图片名
      alink.click()
    },
    downXml () {
      let name = 'result' + '.xml'
      this.doSave(this.xmlContentGoal, 'text/xml', name)
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
    createDiagram () {
      this.$ajax.post('api/diagram', {
        diagramName: this.inputName,
        jsonContent: '{"class":"GraphLinksModel","modelData":{"position":"-478 -365"},"nodeDataArray":[],"linkDataArray":[]}',
        // 空图片默认值
        imageContent: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAT4AAACyCAYAAADbPaMnAAAFOElEQVR4Xu3UQQ0AIBADQfDvkDdvLECCjZ1z0Omlc+1zhyNAgEBIYBq+UNuiEiDwBQyfRyBAICdg+HKVC0yAgOHzAwQI5AQMX65ygQkQMHx+gACBnIDhy1UuMAEChs8PECCQEzB8ucoFJkDA8PkBAgRyAoYvV7nABAgYPj9AgEBOwPDlKheYAAHD5wcIEMgJGL5c5QITIGD4/AABAjkBw5erXGACBAyfHyBAICdg+HKVC0yAgOHzAwQI5AQMX65ygQkQMHx+gACBnIDhy1UuMAEChs8PECCQEzB8ucoFJkDA8PkBAgRyAoYvV7nABAgYPj9AgEBOwPDlKheYAAHD5wcIEMgJGL5c5QITIGD4/AABAjkBw5erXGACBAyfHyBAICdg+HKVC0yAgOHzAwQI5AQMX65ygQkQMHx+gACBnIDhy1UuMAEChs8PECCQEzB8ucoFJkDA8PkBAgRyAoYvV7nABAgYPj9AgEBOwPDlKheYAAHD5wcIEMgJGL5c5QITIGD4/AABAjkBw5erXGACBAyfHyBAICdg+HKVC0yAgOHzAwQI5AQMX65ygQkQMHx+gACBnIDhy1UuMAEChs8PECCQEzB8ucoFJkDA8PkBAgRyAoYvV7nABAgYPj9AgEBOwPDlKheYAAHD5wcIEMgJGL5c5QITIGD4/AABAjkBw5erXGACBAyfHyBAICdg+HKVC0yAgOHzAwQI5AQMX65ygQkQMHx+gACBnIDhy1UuMAEChs8PECCQEzB8ucoFJkDA8PkBAgRyAoYvV7nABAgYPj9AgEBOwPDlKheYAAHD5wcIEMgJGL5c5QITIGD4/AABAjkBw5erXGACBAyfHyBAICdg+HKVC0yAgOHzAwQI5AQMX65ygQkQMHx+gACBnIDhy1UuMAEChs8PECCQEzB8ucoFJkDA8PkBAgRyAoYvV7nABAgYPj9AgEBOwPDlKheYAAHD5wcIEMgJGL5c5QITIGD4/AABAjkBw5erXGACBAyfHyBAICdg+HKVC0yAgOHzAwQI5AQMX65ygQkQMHx+gACBnIDhy1UuMAEChs8PECCQEzB8ucoFJkDA8PkBAgRyAoYvV7nABAgYPj9AgEBOwPDlKheYAAHD5wcIEMgJGL5c5QITIGD4/AABAjkBw5erXGACBAyfHyBAICdg+HKVC0yAgOHzAwQI5AQMX65ygQkQMHx+gACBnIDhy1UuMAEChs8PECCQEzB8ucoFJkDA8PkBAgRyAoYvV7nABAgYPj9AgEBOwPDlKheYAAHD5wcIEMgJGL5c5QITIGD4/AABAjkBw5erXGACBAyfHyBAICdg+HKVC0yAgOHzAwQI5AQMX65ygQkQMHx+gACBnIDhy1UuMAEChs8PECCQEzB8ucoFJkDA8PkBAgRyAoYvV7nABAgYPj9AgEBOwPDlKheYAAHD5wcIEMgJGL5c5QITIGD4/AABAjkBw5erXGACBAyfHyBAICdg+HKVC0yAgOHzAwQI5AQMX65ygQkQMHx+gACBnIDhy1UuMAEChs8PECCQEzB8ucoFJkDA8PkBAgRyAoYvV7nABAgYPj9AgEBOwPDlKheYAAHD5wcIEMgJGL5c5QITIGD4/AABAjkBw5erXGACBAyfHyBAICdg+HKVC0yAgOHzAwQI5AQMX65ygQkQMHx+gACBnIDhy1UuMAEChs8PECCQEzB8ucoFJkDA8PkBAgRyAoYvV7nABAgYPj9AgEBOwPDlKheYAAHD5wcIEMgJGL5c5QITIGD4/AABAjkBw5erXGACBB4yA423Bpz8IAAAAABJRU5ErkJggg==',
        diagramType: this.selectedType,
        folderId: this.folder.folderId
      })
        .then((response) => {
          console.log(response)
          const code = response.data.code
          if (code === 1) {
            this.diagrams.push(response.data.data)
          }
          this.inputName = ''
        })
        .catch((error) => {
          console.log(error)
        })
    },
    sortByTime () {
      this.flag = -this.flag
      this.diagrams.sort((a, b) => {
        let ad = new Date(a.createTime.replace('T', ' '))
        let bd = new Date(b.createTime.replace('T', ' '))
        return ad > bd ? this.flag : -this.flag
      })
      console.log(this.diagrams)
    },
    routeTo () {
      // this.showDataGrapth()
      // console.log(2, this.nodes)
      console.log(0, this.diagrams[0])
      for (let i = 0; i < this.diagrams.length; i++) {
        this.diagramIDs.push(this.diagrams[i].diagramId)
        this.diagramTypes.push(this.diagrams[i].diagramType)
        this.diagramNames.push(this.diagrams[i].diagramName)
      }
      this.$router.push({
        path: '/overview',
        query: {
          // nodes: this.curNodes,
          diagramIDs: this.diagramIDs,
          diagramTypes: this.diagramTypes,
          diagramNames: this.diagramNames
        }
      })
    },
    getJsonContext (id) {
      this.$ajax.get('api/diagram', {
        params: {
          'diagramId': id
        }
      })
        .then((response) => {
          console.log(response)
          const code = response.data.code
          if (code === 1) {
            this.diagram = JSON.stringify(response.data.data.jsonContent)
            // this.jsonText = this.diagram.toString()
            // console.log('666', this.diagram)
            // this.jsonText = JSON.stringify(this.diagram)
          }
        })
        .catch((error) => {
          console.log(error)
        })
    },
    showDataGrapth () {
      // let numOfDiagrams = this.diagrams.length

      let curDiagram = this.diagrams[0]
      console.log(curDiagram)
      // let curJsonContext = null
      this.$ajax.get('api/diagram', {
        params: {
          'diagramId': curDiagram.diagramId
        }
      })
        .then((response) => {
          console.log(response)
          const code = response.data.code
          if (code === 1) {
            if (response.data.data.diagramType === 'BPMN') {
            } else {
              this.jsonText = response.data.data.jsonContent
              let jsonObj = JSON.parse(this.jsonText)
              let modelName = jsonObj.class
              console.log(modelName)
              this.nodes.push({name: '通信运营商', type: '角色'})
              this.getNodesAndLinks(jsonObj)
              console.log((this.nodes))
            }
          }
        })
        .catch((error) => {
          console.log(error)
        })

      console.log(this.nodes)
    },
    getNodesAndLinks (jsonObj) {
      let linkArray = jsonObj.linkDataArray
      let nodeArray = jsonObj.nodeDataArray
      let mapping = []
      // let nodes = []
      // let links = []
      for (let i = 0; i < nodeArray.length; i++) {
        mapping.push(nodeArray[i].key)
        let node = {}
        node.name = nodeArray[i].Name
        node.type = nodeArray[i].Type.substring(2, nodeArray[i].Type.length - 2)
        node.nodeType = nodeArray[i].nodeType
        this.nodes.push(node)
      }
      for (let j = 0; j < linkArray.length; j++) {
        let link = {}
        link.source = mapping.indexOf(linkArray[j].from)
        link.target = mapping.indexOf(linkArray[j].to)
        let linkType = linkArray[j].Linktype
        // console.log(linkType)
        linkType = linkType === undefined ? '普通连接' : linkType
        link.relation = linkType
        link.type = 'resolved'
        link.value = 1.3
        this.edges.push(link)
      }
      // this.nodes = nodes
      // this.edges = links
    },
    deleteFolder () {
      this.$ajax.delete('api/folder', {
        params: {
          folderId: this.folder.folderId
        }
      })
        .then((response) => {
          console.log(response)
          const code = response.data.code
          if (code === 1) {
            let index = this.$parent.folders.indexOf(this.folder)
            if (index > -1) {
              this.$parent.folders.splice(index, 1)
            }
          }
        })
        .catch((error) => {
          console.log(error)
        })
    }
  }
}
</script>

<style scoped>
  ._2fd8twDco3d8QZvnSUuJke {
    margin-bottom: 40px;
    width: 250px;
    height: 260px;
    background: #fff;
    border: 1px solid rgba(39, 54, 78, .1);
    text-align: center;
    position: relative;
    transition: all 0.5s ease 0s;
    box-shadow: 0px 1px 2px 0px hsla(213, 6%, 61%, 0.15);
    pointer-events: auto;
  }

  ._2fd8twDco3d8QZvnSUuJke .card {
    position: absolute;
    display: block;
    margin: 0 0 10px 0;
    width: 100%;
    height: 100%;
  }

  ._2fd8twDco3d8QZvnSUuJke .card .card-info {
    margin: 15px;
    transition: all 0.5s ease 0s;
  }

  .card .card-info .time {
    color: #7d8695;
    font-size: 14px;
    line-height: 20px;
  }

  ._2fd8twDco3d8QZvnSUuJke .card .social {
    height: 60px;
    background-color: #fff;
    width: 100%;
    padding: 0;
    margin: 0;
    list-style: none;
    opacity: 0;
    z-index: 1;
    position: absolute;
    left: 50%;
    transition: all 0.5s ease 0s;
  }

  .card .social {
    transform: translateX(-50%);
    bottom: -8%;
  }

  .item:hover .social {
    opacity: 1;
    bottom: 10px;

  }

  .card .social li {
    display: inline-block;
  }

  .card .social li a {
    color: #909090;
    font-size: 16px;
    line-height: 45px;
    text-align: center;
    height: 45px;
    width: 45px;
    margin: 0 7px;
    border: 1px solid #909090;
    border-radius: 50px;
    display: block;
    position: relative;
    transition: all 0.3s ease-in-out;
  }

  .card .social li a:hover {
    color: #fff;
    background-color: #2e86de;
    width: 80px;
  }

  .card .social li a:before,
  .card .social li a:after {
    content: attr(data-tip);
    color: #fff;
    background-color: #2e86de;
    font-size: 12px;
    letter-spacing: 1px;
    line-height: 20px;
    padding: 1px 5px;
    border-radius: 5px;
    white-space: nowrap;
    opacity: 0;
    transform: translateX(-50%);
    position: absolute;
    left: 50%;
    top: -30px;
  }

  .card .social li a:after {
    content: '';
    height: 15px;
    width: 15px;
    border-radius: 0;
    transform: translateX(-50%) rotate(45deg);
    top: -20px;
    z-index: -1;
  }

  .card .social li a:hover:before,
  .card .social li a:hover:after {
    opacity: 1;
  }

  .item:hover .card-image img {
    transform: scale(1.3);
  }

  .card-info h3 {
    font-size: 20px;
    font-weight: 600;
    text-transform: capitalize;
    margin: 0 0 10px;
    transition: all 0.3s ease 0s;
  }

  ._2fd8twDco3d8QZvnSUuJke .card .time {
    color: #7d8695;
    font-size: 13px;
    line-height: 20px;
  }

  .list-content {
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -ms-flex-wrap: wrap;
    flex-wrap: wrap;
    -webkit-box-pack: justify;
    -ms-flex-pack: justify;
    justify-content: space-between;
  }
  .img-show-mask {
    width: 100%;
    height: 100%;
    position: absolute;
    left: 50%;
    top: 500%;
  }
  .itemempty {
    height: 0px;
    width: 250px;
  }

</style>
