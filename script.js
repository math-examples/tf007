
// import { MnistData } from './data';

/**
 * MNIST数据集 - 一张雪碧图
 * 卷积神经网络
 */

/*
卷积神经网络模拟人的视觉处理流程，高效提取特征

1. 卷积层
使用卷积核 image kernels 提取特征（描边等），使用多个卷积核对图像进行卷积操作
卷积层有权重需要训练，卷积核就是权重

2. 池化层
最大池化层用于提取最强的特征
扩大感受野，减少计算量
池化层没有权重需要训练

3. 全连接层
作为输出层
作为分类器
全连接层有权重需要训练

*/

window.data;

async function loadData(s1, s2) {
    // 加载 Mnist 数据
  const data = new MnistData(s1, s2);
   // 获取解析好的数据
  await data.load();
  return data;
}

async function minitData(s1, s2) {
  window.data = await loadData(s1, s2);
}
    
async function train(){
    // 加载20个输入示例
    const examples = data.nextTestBatch(20);
    // console.log(examples);

    // 输出20张图片
    for (let i = 0; i < 20; i += 1) {
        // 提取每个图片的tensor
        const imageTensor = tf.tidy(() => {
            return examples.xs
                .slice([i, 0], [1, 784])
                // 一维转二维
                .reshape([28, 28, 1]); // 单图片为28*28像素
        });

        const canvas = document.createElement('canvas');
        canvas.width = 28;
        canvas.height = 28;
        canvas.style = 'margin: 4px';

        // tensor 转 像素
        await tf.browser.toPixels(imageTensor, canvas);

        // 新建visor实例，将canvas绘制到tensorflow右侧面板中绘图区
        const surface = tfvis.visor().surface({ name: '输入示例' });
        surface.drawArea.appendChild(canvas);
    }

    /**
     * 初始化模型
     */
    const model = tf.sequential();
    // 添加卷积层，第一轮，例如提取横竖
    model.add(tf.layers.conv2d({
        inputShape: [28, 28, 1], // 宽、高、颜色通道(黑白1，彩色rgb为3)
        kernelSize: 5, // 卷积核尺寸，5 x 5，也可 3 x 3 等
        filters: 8, // 案例中为2，此处多设置一些，http://cs231n.github.io/convolutional-networks/
        strides: 1, // 框移动步长
        activation: 'relu', // 激活函数 relu 即 max(0, x)，丢弃 < 0 的数据
        kernelInitializer: 'varianceScaling' // 初始化方法，此方法比较常用
    }));
    // 添加最大池化层
    model.add(tf.layers.maxPool2d({
        poolSize: [2, 2], // 池化尺寸
        strides: [2, 2] // 步长
    }));
    // 重复添加卷积层，第二轮，例如提取直角、弧线等
    model.add(tf.layers.conv2d({
        kernelSize: 5,
        filters: 16,
        strides: 1,
        activation: 'relu',
        kernelInitializer: 'varianceScaling'
    }));
    // 重复添加最大池化层
    model.add(tf.layers.maxPool2d({
        poolSize: [2, 2],
        strides: [2, 2]
    }));
    // 二维特征图 filter 转一维
    model.add(tf.layers.flatten());
    // 添加全连接层
    model.add(tf.layers.dense({
        units: 10,
        activation: 'softmax', // 多分类激活函数
        kernelInitializer: 'varianceScaling'
    }));
    
    // 设置参数
    model.compile({
        loss: 'categoricalCrossentropy', // 交叉熵
        optimizer: tf.train.adam(),
        metrics: ['accuracy']
    });

    // 准备训练数据
    const [trainXs, trainYs] = tf.tidy(() => {
        const d = data.nextTrainBatch(1000);
        return [
            d.xs.reshape([1000, 28, 28, 1]), // 1维数据转3维
            d.labels
        ];
    });
    // 准备验证数据
    const [testXs, testYs] = tf.tidy(() => {
        const d = data.nextTestBatch(200);
        return [
            d.xs.reshape([200, 28, 28, 1]),
            d.labels
        ];
    });

    // 训练
    await model.fit(trainXs, trainYs, {
        validationData: [testXs, testYs],
        batchSize: 500,
        epochs: 100, // 100轮
        callbacks: tfvis.show.fitCallbacks(
            { name: '训练效果' },
            ['loss', 'val_loss', 'acc', 'val_acc'],
            { callbacks: ['onEpochEnd'] }
        )
    });

    // 预测，核心！
    window.predict = () => {
        const canvas = document.querySelector('canvas');
        // 涉及到较多tensor操作，放到tidy中
        const input = tf.tidy(() => {
            // 图片 resize，300 x 300 转 28 x 28
            return tf.image.resizeBilinear(
                // canvas转tensor，fromPixels接受图片或canvas
                tf.browser.fromPixels(canvas),
                [28, 28],
                true // 4个边角
            ).slice([0, 0, 0], [28, 28, 1]) // 切第一层，转换成黑白
            .toFloat()
            .div(255) // 归一化
            .reshape([1, 28, 28, 1]); // 1个图片 28 x 28 黑白
        });
        const pred = model.predict(input).argMax(1);
        alert(`预测结果为 ${pred.dataSync()[0]}`);
    };
};


var mMNIST_IMAGES_SPRITE_PATH = '';
var mMNIST_LABELS_PATH = '';

const myLoad = async (e) => {
    document.querySelector('#load-data').innerHTML = 'Loading...';
    await minitData(mMNIST_IMAGES_SPRITE_PATH, mMNIST_LABELS_PATH);
    document.querySelector('#start-training-1').disabled = false;
    document.querySelector('#load-data').disabled = true;
}

function getUrl(){

const cb2 =  (files)=>{

let urls = [];

// Store promises in array
for(let i = 0;i < files.length;i++){
urls.push(readFileAsUrl(files[i]));
}
                
// Trigger Promises
Promise.all(urls).then((values) => { mMNIST_LABELS_PATH = values[0];  
myLoad();});
};


const show2 = () => showCB('Get file mnist_labels_uint8 from server?', 'Yes', 'No, choose from local.', myLoad, cb2);

const cb1 =  (files)=>{
let urls = [];

// Store promises in array
for(let i = 0;i < files.length;i++){
urls.push(readFileAsUrl(files[i]));
}

// Trigger Promises
Promise.all(urls).then((values) => {
if(mMNIST_IMAGES_SPRITE_PATH==''){ // for bug
    mMNIST_IMAGES_SPRITE_PATH = values[0];  
    show2();
}
});
};

showCB('Get file mnist_images.png from server?', 'Yes', 'No, choose from local.', show2, cb1);

}

function setupListeners() {
    document.querySelector('#start-training-1')
          .addEventListener('click', () => train());
  document.querySelector('#load-data').addEventListener('click', (e)=> getUrl());
}

setupListeners();