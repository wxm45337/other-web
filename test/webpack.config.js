/**
 created by wuxinm
*/
var path = require('path'),
    fs = require('fs'),
    webpack = require('webpack');
    // CleanWebpackPlugin = require('clean-webpack-plugin');

var srcDir = path.resolve(process.cwd(), 'routes');
//获取多页面的每个入口文件，用于配置中的entry
function getEntry() {
    var jsPath = path.resolve(srcDir, 'routes');
    console.log(jsPath,'------');
    var dirs = fs.readdirSync(srcDir);
    var matchs = [], files = {};
    dirs.forEach(function (item) {
        matchs = item.match(/(.+)\.js$/);
        // console.log(matchs);
        if (matchs) {
            files[matchs[1]] = path.resolve(srcDir, item);
        }
    });
    // console.log(JSON.stringify(files));
    return files;
}

module.exports = {
    cache: true,
    devtool: "eval",//"source-map",
    entry: getEntry(),
    devServer: {
        inline: true,
        port: 3333
    },
    output: {
        path: path.join(__dirname, './dist/'),
        publicPath: "dist/",
        filename: "[name].js"
    },
    resolve: {
        extensions: ['', '.js', '.json', '.scss'],
        alias: {
            $: 'jquery',
            jQuery: 'jquery',
            "window.jQuery": "jquery"
        }
    },
    module: {
        preLoaders: [{
            test: /\.(js|jsx)$/,
            loader: 'eslint-loader',
            include: [path.resolve(__dirname, "src/js")]
        }],
        loaders: [ {
          test: /\.less/,
          loader: 'style-loader!css-loader!less-loader'
        }, {
          test: /\.(css)$/,
          loader: 'style-loader!css-loader'
        }, {
          test: /\.(png|jpg)$/,
          loader: 'url-loader?limit=8192'
        }]
    },
    plugins: [
        /*new CleanWebpackPlugin(['dist'],{
            root: "", // 一个根的绝对路径.
            verbose: true, // 将log写到 console.
            dry: false,// 不要删除任何东西，主要用于测试.
            exclude:['server','src']//排除不删除的目录，主要用于避免删除公用的文件
        }),*/
        //提供全局的变量，在模块中使用无需用require引入
        new webpack.ProvidePlugin({
            jQuery: "jquery",
            $: "jquery"
            // nie: "nie"
        }),
        //将公共代码抽离出来合并为一个文件
        // new webpack.optimize.CommonsChunkPlugin('common.js'),
        new webpack.DefinePlugin({
            'process.env':{
                'NODE_ENV': JSON.stringify('production')
            }
        }),
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            }
        })
        //,new webpack.HotModuleReplacementPlugin()
    ]
};