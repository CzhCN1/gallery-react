require('normalize.css/normalize.css');
require('styles/App.scss');

import React from 'react';

let yeomanImage = require('../images/yeoman.png');

/*
    从json文件获取图片相关的数据
 */
var imageDatas = require('../data/imageDatas.json');

/**
 * 从图片数据中得到图片的路径
 * @type {[type]}
 */
imageDatas = (function(imageDatasArr){
  for(let i = 0,len = imageDatasArr.length; i<len;i++){
    var singleImageData = imageDatasArr[i];
    singleImageData.imageURL = require('../images/' + singleImageData.fileName);
    imageDatasArr[i] = singleImageData;
  }
  return imageDatasArr;
})(imageDatas);

var AppComponent = React.createClass({
  render: function(){
    return (
      <section className="stage">
        <section className="img-sec">
        </section>
        <nav className="controller-nav">
        </nav>
      </section>
    );
  }
});


export default AppComponent;
