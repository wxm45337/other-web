module.exports = function(grunt) {
 grunt.config.init({
        pkg: grunt.file.readJSON('package.json'),  
        config :{
            static_dest:'js/' 
            // ,views_dest:'release/main/webapp/static/union/' 
        },
        clean:{
            js: ['build/js/*.js'],
            css: ['build/css/*.css']
        },
        copy: {
           main: {
             files: [
              // 复制path目录下的所有文件
               {  
                  cwd:'resources/html',
                  src: '*',
                  dest: '', 
                  // filter: 'isFile'
                  expand: true 
                } 
               // {src: ['path/**'], dest: 'dest/'}, // 复制path目录下的所有目录和文件
             ]
           }
        },
        uglify: {  
           options: {  
             banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',
              beautify: true,//是否压缩
               mangle: false, //不混淆变量名
               compress:true//打开或关闭使用默认选项源压缩。
           },  
           dist: {
             files: {
                'build/js/min.new.lib.js': [
                     'bower_components/jquery/jquery.min.js',
                     'bower_components/highcharts/highcharts.js',
                     'bower_components/highcharts/highcharts-more.js',

                     'bower_components/jquery-easyui/jquery.easyui.min.js',
                     'bower_components/jquery-easyui/locale/easyui-lang-zh_CN.js',
                     'bower_components/jquery-easyui/plugins/jquery.datagrid.js',

                     'bower_components/jquery-loading/dist/jquery.loading.min.js',
                     'bower_components/jquery-zclip/jquery.zclip.js',
                     'bower_components/ion.rangeSlider/js/ion.rangeSlider.min.js',
                     'bower_components/JSON-js-master/json2.js',
                     'bower_components/jquery-form/jquery.form.js',

                     'common/js/plug/jquery.cookies.2.2.0.min.js',
                     'common/js/plug/jquery.ddslick.js',
                     'common/js/plug/My97DatePicker/WdatePicker.js',
                     'common/js/plug/layer/layer.js',
                     'common/js/plug/pinyin.js'
                ]
                ,'build/js/min.new.common.js':[
                    'js/main/global.js',
                    'js/main/config.js',
                     'js/main/public.js',
                     'js/main/top.js',
                     'js/main/common.js',
                     'js/main/load.js',
                     //'js/main/detail.js',
                     'js/plug-custom/custom-window.js',
                     'js/plug-custom/jquery-plug.js',
                     'js/plug-custom/copy-url.js',
                     'js/plug-custom/jquery-plug.js',
                     'js/plug-custom/serviceType.js',
                     'js/plug-custom/netWork.js',
                     'js/plug-custom/userAgent.js',
                     'js/plug-custom/userAgentList.js',
                     'js/plug-custom/protocol.js',
                     'js/plug-custom/flowBill.js',
                     'js/plug-custom/flowTrail.js',
                     'js/plug-custom/flowFeeTrail.js',
                     'js/plug-custom/serviceTypeList.js',
                     'js/plug-custom/protocolList.js',
                     'js/plug-custom/flowCompare.js',
                     'js/chaxun/month.js','js/chaxun/day.js',
                     'js/guiji/guiji.js','js/fengxi/fengxi.js',
                     'js/tousu/tousu.js'
                ]
                ,'build/js/min.new.main.js': [
                     'js/main/index.js',
                     'system/js/outlogin.js',
                     'report/js/report.js','report/js/flowerror.js',
                     'report/js/quality.js','report/js/matchingrate.js',
                     'report/js/errorexception.js','report/js/uqualitycount.js',
                     'report/js/bigflowmatching.js'
                ]
                ,'build/js/min.new.outside.js': [
                      'js/main/outside.js'
                ]
             }
           }
        },
        cssmin: {
              options: {
                  keepSpecialComments: 0
              },
              compress: {
                  files: {
                    'build/css/min.new.lib.css': [
                          "bower_components/jquery-easyui/themes/default/easyui.css",
                          "bower_components/jquery-easyui/themes/icon.css",
                          'bower_components/jquery-loading/dist/jquery.loading.min.css',
                          'bower_components/ion.rangeSlider/css/ion.rangeSlider.css',
                          'bower_components/ion.rangeSlider/css/ion.rangeSlider.skinNice.css'
                    ]
                    ,'build/css/min.login.css': [ 
                        'login/css/login.css' ,'login/css/layout.css'
                    ]
                    ,'build/css/min.new.common.css': [
                          "css/main.css",
                          "css/common.css",
                          "css/plug-custom.css",
                          'css/guiji.css',
                          'css/chaxun.css'
                      ]
                  }
              }
        },
        rev: {
             options: {
                 encoding: 'utf8',
                 algorithm: 'md5',
                 length: 8
             },
             assets: {
                 files: [{
                     src: [
                         'build/css/*.css',
                         'build/js/*.js'
                     ]
                 }]
             }
        },
        usemin:{
            css:{
                files:{
                    src:['build/css/*.css']
                }
            },
            js:['build/js/*.js'],
            html:['**/*.html','*.html']
        }
     });
    grunt.loadNpmTasks('grunt-usemin');
    grunt.loadNpmTasks('grunt-rev');
    grunt.loadNpmTasks('grunt-contrib-uglify');  
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    // grunt.loadNpmTasks('grunt-contrib-concat');

     grunt.registerTask('dpi',[
        'copy'
        ,
        'clean',
        // 'concat',
        'uglify'
        ,'cssmin'
        ,'rev'
        ,'usemin'
     ]);

     grunt.registerTask('default',[
        'copy'
        ,
        'clean',
        // 'concat',
        'uglify'
        ,'cssmin'
        ,'rev'
        ,'usemin'
     ]);
};  