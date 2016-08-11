require('normalize.css/normalize.css');
require('styles/App.scss');

import ReactDOM from 'react-dom';
import React from 'react';

/*
    从json文件获取图片相关的数据
 */
var imageDatas = require('../data/imageDatas.json');
/**
 * 从图片数据中得到图片的路径
 * @type {[type]}
 */
imageDatas = (function getImageURL(imageDatasArr){
  for(var i = 0, len = imageDatasArr.length; i < len ; i++){
    var singleImageData = imageDatasArr[i];
    singleImageData.imageURL = require('../images/' + singleImageData.fileName);
    imageDatasArr[i] = singleImageData;
  }
  return imageDatasArr;
})(imageDatas);

/**
 * 在区间内获取一个随机值
 * @param  {[type]} low  区间值左端点值
 * @param  {[type]} high 区间值右端点值
 * @return {[type]}      区间随机值
 */
function getRangeRandom(low, high){
  return Math.ceil(Math.random() * (high - low ) + low)
}

/**
 * 生成一个随机角度(+30deg ~ -30deg)
 * @return {[type]} 生成的角度
 */
function getDegRandom(){
  return (
    (Math.random() > 0.5 ? '' : '-') + Math.floor(Math.random() * 31)
  )
}


/***********************************************************
 * 图片组件
 * @type {[type]}
 ***********************************************************/
var ImgFigure = React.createClass({
  handleClick: function(e){
    //如果图片居中，则翻转
    if(this.props.arrange.isCenter){
      this.props.inverse();
    } else{
    //否则使该图片居中
      this.props.center();
    }

    e.stopPropagation();
    e.preventDefault();
  },

  render: function(){
    //样式对象
    var styleObj = {};
    //如果设置了该图片的位置
    if(this.props.arrange.pos){
      styleObj = this.props.arrange.pos;
    }
    //如果图片的旋转角度不为0，添加旋转角度
    if(this.props.arrange.rotate){
      ['Moz','ms','Webkit',''].forEach(function(value){
        styleObj[value + 'transform'] = 'rotate(' + this.props.arrange.rotate + 'deg)';
      }.bind(this));
    }
    //如果是居中图片，设置zindex高于其余图片
    if(this.props.arrange.isCenter){
      styleObj.zIndex = 11;
    }
    //为每个图片组件添加类名
    var imgFigureClassName = 'img-figure';
    imgFigureClassName += this.props.arrange.isInverse ? ' is-inverse' : '';

    return (
      <figure className={imgFigureClassName} style={styleObj} onClick={this.handleClick}>
        <img
          src = {this.props.data.imageURL}
          alt = {this.props.data.title}
        />
        <figcaption>
          <h2 className="img-title">{this.props.data.title}</h2>
          <div className="img-back" onClick={this.handleClick}>
            <p>
              {this.props.data.desc}
            </p>
          </div>
        </figcaption>
      </figure>
    );
  }
});

/***********************************************************
 * 控制单元组件
 * @type {[type]}
 ***********************************************************/
var ContollerUnit = React.createClass({
  handleClick: function(e){
    //如果图片居中，则翻转
    if(this.props.arrange.isCenter){
      this.props.inverse();
    } else{
    //否则使该图片居中
      this.props.center();
    }
    
    e.stopPropagation();
    e.preventDefault();
  },
  render: function(){
    var controllerUnitClassName = 'controller-unit';
    //如果对应的图片居中，显示控制按钮的居中态
    if(this.props.arrange.isCenter){
      controllerUnitClassName += ' is-center';

      //如果该居中图片处于翻转状态，显示控制按钮的翻转态
      if(this.props.arrange.isInverse){
        controllerUnitClassName += ' is-inverse';
      }
    }

    return (
      <span className={controllerUnitClassName} onClick={this.handleClick}>
      </span>
    );
  }
})


/***********************************************************
 * 核心画廊组件
 * @type {[type]}
 ***********************************************************/
var AppComponent = React.createClass({
  Constant: {
    //中心位置
    centerPos: {
      left: 0,
      top: 0
    },
    //左右区块位置取值范围
    hPosRange: {
      leftSecX: [0,0],
      rightSecX: [0,0],
      y: [0,0]
    },
    //顶部区块的取值范围
    vPosRange: {
      x: [0,0],
      topY: [0,0]
    }
  },

  /**
   * 图片翻转
   * @param  {[type]} index 被翻转图片的索引
   * @return {Function}     待执行函数
   */
  inverse: function(index){
    return function(){
      var imgsArrangeArr = this.state.imgsArrangeArr;
      //更新翻转状态
      imgsArrangeArr[index].isInverse = !imgsArrangeArr[index].isInverse;
      //设置state状态，重新渲染
      this.setState({
        imgsArrangeArr : imgsArrangeArr
      })
    }.bind(this);
  },

  /**
   * 重新布局图片
   * @param  {[type]} centerIndex [居中图片的索引]
   * @return {[type]}             [description]
   */
  rearrange: function(centerIndex){
    var imgsArrangeArr = this.state.imgsArrangeArr,
        Constant = this.Constant,
        centerPos = Constant.centerPos,
        hPosRange = Constant.hPosRange,
        vPosRange = Constant.vPosRange,
        hPosRangeLeftSecX = hPosRange.leftSecX,
        hPosRangeRightSecX = hPosRange.rightSecX,
        hPosRangeY = hPosRange.y,
        vPosRangeTopY = vPosRange.topY,
        vPosRangeX = vPosRange.x,

        //顶部区块的图片数组
        imgsArrangeTopArr = [],
        //顶部区块图片数 0或者1
        topImgNum = Math.floor(Math.random() * 2),
        //顶部区块图片索引
        topImgSpliceIndex = 0,

        //取出要居中的图片数组
        imgsArrangeCenterArr = imgsArrangeArr.splice(centerIndex,1);

    //布局要居中的图片,居中图片不需要旋转,图片居中true
    imgsArrangeCenterArr[0] = {
      pos: centerPos,
      rotate: 0,
      isCenter: true
    };

    //上部的图片索引
    topImgSpliceIndex = Math.floor(Math.random() * (imgsArrangeArr.length - topImgNum));
    //取出上部图片的数组
    imgsArrangeTopArr = imgsArrangeArr.splice(topImgSpliceIndex,topImgNum);
    //布局上部的图片
    imgsArrangeTopArr.forEach(function(value,index){
      imgsArrangeTopArr[index] = {
        pos: {
          top: getRangeRandom(vPosRangeTopY[0],vPosRangeTopY[1]),
          left: getRangeRandom(vPosRangeX[0],vPosRangeX[1])
        },
        rotate: getDegRandom(),
        isCenter: false
      }
    });

    //布局左右两侧的图片
    for(let i = 0,len = imgsArrangeArr.length,k = Math.floor(len / 2);i < len; i++){

      var hPosRangeLORX = null;
      //前半部分布局在左侧,后半部分布局在右边
      if (i < k) {
          hPosRangeLORX = hPosRangeLeftSecX;
      } else {
          hPosRangeLORX = hPosRangeRightSecX;
      }
      imgsArrangeArr[i] = {
        pos: {
          top: getRangeRandom(hPosRangeY[0],hPosRangeY[1]),
          left: getRangeRandom(hPosRangeLORX[0],hPosRangeLORX[1])
        },
        rotate: getDegRandom(),
        isCenter: false
      }
    }

    //把设置好状态的数组组合并成完整的图片列表
    if(imgsArrangeTopArr && imgsArrangeTopArr[0]){
      imgsArrangeArr.splice(topImgSpliceIndex,0,imgsArrangeTopArr[0]);
    }
    imgsArrangeArr.splice(centerIndex,0,imgsArrangeCenterArr[0]);

    //设置状态，重新渲染view
    this.setState({
      imgsArrangeArr: imgsArrangeArr
    });

  },

  /**
   * 点击图片，该图片居中
   * @param  {[type]} index 被点击图片的索引
   * @return {Function}      待执行函数
   */
  center: function(index){
    return function(){
      this.rearrange(index);
    }.bind(this);
  },

  /**
   * 设置初始状态
   * @return {[type]} [description]
   */
  getInitialState: function(){
    return {
      imgsArrangeArr: [
        // {
        //   pos: {
        //     left: 0,
        //     top: 0
        //   },
        //   rotate: 0,
        //   isInverse: false,
        //   isCenter: false,
        // }
      ]
    }
  },

  /**
   * 组件加载后，为每张图片计算图片位置
   * @return {[type]} [description]
   */
  componentDidMount : function(){
    //获取视窗界面大小
    var stageDOM = ReactDOM.findDOMNode(this.refs.stage),
        stageW = stageDOM.scrollWidth,
        stageH = stageDOM.scrollHeight,
        halfStageW = Math.ceil(stageW / 2),
        halfStageH = Math.ceil(stageH / 2);

    //获取ImgFigure组件的大小
    var imgFigureDOM = ReactDOM.findDOMNode(this.refs.imgFigure0),
        imgW = imgFigureDOM.scrollWidth,
        imgH = imgFigureDOM.scrollHeight,
        halfImgW = Math.ceil(imgW / 2),
        halfImgH = Math.ceil(imgH / 2);

    //计算中心图片位置
    this.Constant.centerPos = {
      left: halfStageW - halfImgW,
      top: halfStageH - halfImgH
    };
    //计算左右区块位置范围
    this.Constant.hPosRange.leftSecX[0] = -halfImgW;
    this.Constant.hPosRange.leftSecX[1] = halfStageW - halfImgW * 3;
    this.Constant.hPosRange.rightSecX[0] = halfStageW + halfImgW;
    this.Constant.hPosRange.rightSecX[1] = stageW - halfImgW;
    this.Constant.hPosRange.y[0] = -halfImgH;
    this.Constant.hPosRange.y[1] = stageH - halfImgH;
    //计算顶部区块位置范围
    this.Constant.vPosRange.topY[0] = -halfImgH;
    this.Constant.vPosRange.topY[1] = halfStageH - halfImgH * 3;
    this.Constant.vPosRange.x[0] = halfStageW - imgW;
    this.Constant.vPosRange.x[1] = halfStageW;

    this.rearrange(0);
  },

  render: function(){
    var controllerUnits = [], //控制单元数组
        imgFigures = [];      //图片数组

    imageDatas.forEach(function(value,index){
      //状态初始化
      if(!this.state.imgsArrangeArr[index]){
        this.state.imgsArrangeArr[index] = {
          pos: {
            left: 0,
            top: 0
          },
          rotate: 0,
          isInverse: false,
          isCenter: false
        }
      }

      imgFigures.push(<ImgFigure data={value} key={index} ref={'imgFigure'+index} arrange={this.state.imgsArrangeArr[index]} inverse={this.inverse(index)} center={this.center(index)}/>);

      controllerUnits.push(<ContollerUnit key={index} arrange={this.state.imgsArrangeArr[index]} inverse={this.inverse(index)} center={this.center(index)}/>);
    }.bind(this));



    return (
      <section className="stage" ref="stage">
        <section className="img-sec">
          {imgFigures}
        </section>
        <nav className="controller-nav">
          {controllerUnits}
        </nav>
      </section>
    );
  }
});


export default AppComponent;
