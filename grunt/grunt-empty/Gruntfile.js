"use strict";

module.exports = function(grunt){
	require('load-grunt-tasks')(grunt);
	require('time-grunt')(grunt);

	var config = {
		app : 'app',
		dist: 'dist'
	}
	grunt.initConfig({
		config : config,

		copy : {
			dist:{
				files: [
					{
						expand: true,
						cwd: '<%= config.app %>/',
						src: '**/*',
						dest: '<%= config.dist %>/'
						//,ext: '.min.html'
						//,extDot: 'first'
						//,flatten: true  //去掉目录，直接放在根目录
						//rename: function( dest , src){   //重命名
						//}
					}
				]
			}
		},
		clean: {
			dist : {
				src: ['<%= config.dist %>/**/*']
				//filter: function(filepath){   // 'isFile'
				//	return (!grunt.file.isDir(filepath));
				//},
				//dot: true //命中以. 的文件
				//matchBase: true  a?b /xyz/123/acb /xyz/acb/123
				//expand: true 
			}
		}
	});
}