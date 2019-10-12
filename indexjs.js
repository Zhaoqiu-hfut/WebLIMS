layui.use(['form', 'element', 'upload', 'layer'], function(){
    var $ = layui.jquery
        ,upload = layui.upload
        ,element = layui.element
        ,layer = layui.layer
        ,form = layui.form
        ,layedit = layui.layedit
        ,laydate = layui.laydate; //Tab的切换功能，切换事件监听等，需要依赖element模块

    //触发事件
    var active = {
        tabChange: function(){
            //切换到指定Tab项
            element.tabChange('demo', '22'); //切换到：用户管理
        }
    };

    // d3读取文件
    // 拖曳回调函数
    function handleFileSelect(evt) {
        evt.stopPropagation();
        evt.preventDefault();

        var files = evt.dataTransfer.files; // FileList object.

        // files is a FileList of File objects. List some properties.
        var output = [];
        for (var i = 0, f; f = files[i]; i++) {
            output.push('<li><strong>', escape(f.name), '</strong></li>');
        }
        document.getElementById('laserfilename').innerHTML = '<ul>' + output.join('') + '</ul>';

        // (', f.type || 'n/a', ') - ',
        // f.size, ' bytes, last modified: ',
        //     f.lastModifiedDate ? f.lastModifiedDate.toLocaleDateString() : 'n/a',
        //     '
        // 读取文件
        var file = files[0];
        var reader = new FileReader();
        reader.onload = (function(theFile) {
            return function(e) {
                readLaserFile(e.target.result);
            };
        })(file);

        reader.readAsDataURL(file);
    }

    // 质谱拖曳回调
    function handleMappingFileSelect(evt) {
        evt.stopPropagation();
        evt.preventDefault();

        var files = evt.dataTransfer.files; // FileList object.

        // files is a FileList of File objects. List some properties.
        var output = [];
        for (var i = 0, f; f = files[i]; i++) {
            output.push('<li><strong>', escape(f.name), '</strong></li>');
        }
        document.getElementById('mappingfilename').innerHTML = '<ul>' + output.join('') + '</ul>';

        // (', f.type || 'n/a', ') - ',
        // f.size, ' bytes, last modified: ',
        //     f.lastModifiedDate ? f.lastModifiedDate.toLocaleDateString() : 'n/a',
        //     '
        // 读取文件
        var file = files[0];
        var reader = new FileReader();
        reader.onload = (function(theFile) {
            return function(e) {
                readMappingFile(e.target.result);
            };
        })(file);

        reader.readAsDataURL(file);
    }

    // 读取激光数据
    // 去掉表头前的内容，表尾，表头内容无空格
    // 暂时未解决表头字符间的空格
    // Timestamp, Sequence Number, SubPoint Number, Vertix Number, Comment, X, Y, Intended X, Intended Y, Scan Velocity, Laser State, Laser Rep. Rate, Spot Type, Spot Size, Spot Angle, MFC1, MFC2, Cell Pressure
    var laserData;
    var laserDataColumns;
    function readLaserFile(url) {
        fetch(url)
            .then(response => response.text())
            .then(text => {
                laserData = d3.csvParse(text, d3.autoType);
                // console.log(laserData);
                laserDataColumns = laserData.columns;
                // console.log(laserDataColumns);

                layer.msg('读取激光数据结束！')
            });
        // console.log(url)
        // d3.dsv(",", url, function(d) {
        //     return {
        //         laserTime: d["Timestamp"],
        //         laserComment: d[" Comment"],
        //         laserX: +d[" X"],
        //         laserY: +d[" Y"],
        //         laserIntendedX: +d[" Intended X"],
        //         laserIntendedY: +d[" Intended Y"],
        //         laserScanVelocity: +d[" Scan Velocity"],
        //         laserState: d[" Laser State"],
        //         laserSpotSize: +d[" Spot Size"]
        //         // year: new Date(+d.Year, 0, 1), // convert "Year" column to Date
        //         // make: d.Make,
        //         // model: d.Model,
        //         // length: +d.Length // convert "Length" column to number
        //     };
        // }).then(function(data) {
        //     // return data
        //     laserData = data;
        //     console.log(laserData);
        // });
    }

    // **************************************
    // 读文件是异步操作！！！！！！！！！！！！！！！
    // *******************************************
    // 读取质谱文件
    // 去掉表头多余
    // Time [Sec],Li7,B11,Na23,Mg25,Al27,Si29,P31,K39,Ca42,Sc45,Ti49,V51,Cr53,Mn55,Fe57,Co59,Ni60,Cu63,Zn66,Ga71,Rb85,Sr88,Y89,Zr90,Sn118,Ba137,La139,Ce140,Pr141,Nd146,Sm147,Eu153,Gd157,Tb159,Dy163,Ho165,Er166,Tm169,Yb172,Lu175,Hf178,Ta181,W182,Au197,Pb208,Th232,U238
    var mappingData;
    var mappingDataColumns;
    function readMappingFile(url) {
        // 第一次读文件获取表头，元素符号
        // var test = d3.dsv(",", url);
        // var test = d3.csvParse(url, d3.autoType);
        fetch(url)
            .then(response => response.text())
            .then(text => {
                mappingData = d3.csvParse(text, d3.autoType);
                // console.log(mappingData);
                mappingDataColumns = mappingData.columns;
                MassSpectrum.ElementsName = mappingDataColumns.slice(1)
                });


        // var test = typeof mappingData;
        // console.log(mappingData);
            // .then(text => console.log(text))
        // d3.dsv(",", url, function(d) {
        //     return {
        //         mappingTime: d["Time [Sec]"],
        //     };
        // }).then(function(data) {
        //     // return data
        //     mappingDataColumns = data.columns;
        //     // mappingData = data;
        //     // console.log(mappingData.columns);
        // });
        // // 第二次根据元素符号存储键值
        // d3.dsv(",", url, function(d) {
        //     return {
        //         mappingTime: +d["Time [Sec]"],
        //         Li7: +d[mappingDataColumns[1]]
        //     };
        // }).then(function(data) {
        //     // mappingDataColumns = mappingData.columns;
        //     mappingData = data;
        //     console.log(mappingData);
        // });
    }


    // 定义质谱对象
    var  MassSpectrum= {
        // 质谱路径
        filapath : '',
        // 激光实例
        MassFileCreatedTimeStr : '2000/01/01 00:00:00',
        MassFileCreatedTimeStrFormat : '%Y/%m/%d %H:%M:%S',
        MassFileCreatedTimeSec : 946656000.0,
        MassTimeSecFromZero : [],    // 从0开始，相当于文件创建的偏移量
        MassTimeSec : [],  // MassTimeSecFromZero + 创建文件的sec
        MassTimeOffset : 0.0,
        IsTimeAdjusted : false,  // 是否调整过时间
        MassTimeSecAdjusted : null,
        MassTimeStrAdjusted : [],
        ElementsName : [],
        ElementsNameAndIndex : {},
        // 未去背景的cps
        AllEleCps : [],
        AllEleCpsT : [],
        // 去背景的cps
        AllEleCpsSubBg : [],
        AllEleCpsSubBgT : [],
        // 只有mapping区域
        AllEleCpsOnlyMap : [],
        AllEleCpsOnlyMapT : [],
        AllElePpmOnlyMap : [],
        AllElePpmOnlyMapT : [],
        AllEleSemiPpmOnlyMap : [],
        AllEleSemiPpmOnlyMapT : [],
        // 只有mapping区域cps对应的xy
        XY2DtoGriddataArgument : [],
        XY2DtoGriddataArgumentT : [],
        // 前后标样cps平均值
        StanCpsMeanFrontAndBack : [],
        StanCpsMeanFrontAndBackOfTiemSec : [],
        // 前后标样整体平均值
        StanCpsMeanFrontAndBackToOneArray : null,
        // 前后标样cps与内标的比值
        StanCpsMeanIntEleRatioFrontAndBack : [],
        // 前后标样cps漂移插值
        StanRatioInMassDriftAllTime : [],
        StanRatioInMassDriftAllTimeT : [],
        // 各段背景值
        AllSegmentBgTime : [],
        AllSegmentBgCps : [],
        AllSegmentBgCpsMean : null,
        AllBgCpsMean : null,
        // 共多少元素
        EleCount : 0,
        //

        // 带T的都是列向量
        RatioAllEleandInteraEle : [],
        RatioAllEleandInteraEleT : [],
        // 内标校正PPM
        AllElePpmInterEle : [],
        AllElePpmInterEleT : [],
        // 半定量的PPM
        SemiPpm : [],
        SemiPpmT : [],
        isGrid : false,
        TimeAdjusted_GridX : null,
        TimeAdjusted_GridY : null,
        AllElePpmGrid : null,
        AllEleSemiPpmGrid : null,

        AllEleCpsGrid : [],
        AllEleCpsGridT : [],
        IntEle : '',
        IndexIntEle_InGrid : -1,
        IntEleCps : 0,
        IntElePpm : 0,
        IsSubBg : false,
        // 标样名称
        StandardSamName : '',

        // 标样csv重排顺序
        StandardcsvPPM_new_order : null,
        // 标样csv 中ppm与内标相除
        StandardcsvPPM_new_order_Ratio : []

    };

    // 定义激光文件
    var LaserLog = {


        // '2016/07/20 14:59:01.713', '1', '1', '', 'GSE-1G', '66181', '57396', '', '', '', 'Off', '0', 'Manual: B', '60', '0', '0', '0', '0']

        // 激光文件名
        filepath : '',
        // 开始截止时间,
        LaserFirstTimeSec : 0,
        LaserLastTimeSec : 0,
        LaserBeginTimeStr : '',  //0,
        LaserEndTimeStr : '',
        LaserTimeStrFormat : '%Y/%m/%d %H:%M:%S',
        LaserTimeStr : [],
        LaserTimeSec : null,
        LaserComment : [],   // 4 标样名字和线号，列,
        LaserAllX : [],    // 5
        LaserAllY : [],    // 6
        LaserIntendedX : [],   // 7
        LaserIntendedY : [],   // 8
        LaserIntendedXNoNone : [],     // 取出空值
        LaserIntendedYNoNone : [],
        LaserIntendedXYtime : [],
        LaserVelocity : 0,    // 9
        LaserOnOff : [],     // 10
        LaserONOffNumber : [],     // 0101010
        LaserIntensiveONOffNumber : [],
        LaserIntensiveONOffTime_0_1s : [],
        LaserSpotSize : 0,    // 13
        LaserXYOn : [],    // 激光开关状态记录，二维
        LaserXYOff : [],
        LaserTimeOn : [],      // 一维
        LaserTimeOff : [],
        // 面扫每条线的信息
        LaserLineBeginTimeSec : null,
        LaserLineEndTimeSec : null,
        LaserLineBeginXY : null,
        LaserLineEndXY : null,
        // 背景宽度
        // BackgroundWidth : 20,
        BackgroundWidth : 20000,
        LaserBackgroundTime : [],

        //开始面扫前的标样的信号
        StanOfMappingList : [],
        StandardSamName : ['SRM 610', 'SRM 612', 'SRM 614', 'MACS-1', 'GSC-1G', 'GSD-1G', 'GSE-1G']

        // 定义各种槽函数
        // 停止读激光的信号

    };
    // var StanOfMapping = {
    //     Name : '',
    //     BeginSec : 0,
    //     EndSec : 0,
    //     X : 0,
    //     Y : 0
    // };
    function handleDragOver(evt) {
        evt.stopPropagation();
        evt.preventDefault();
        evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
    }
    // 点击回调函数

    function clickHandleFileSelect(evt) {
        var files = evt.target.files; // FileList object

        // files is a FileList of File objects. List some properties.
        var output = [];
        // var f = files[0];
        // output.push('<li><strong>', escape(files[0].name), '</strong> (', files[0].type || 'n/a', ') - ',
        //     files[0].size, ' bytes, last modified: ',
        //     files[0].lastModifiedDate ? files[0].lastModifiedDate.toLocaleDateString() : 'n/a',
        // '</li>');
        for (var i = 0, f; f = files[i]; i++) {
            output.push('<li><strong>', f.name, '</strong></li>');
        }
        document.getElementById('laserfilename').innerHTML = '<ul>' + output.join('') + '</ul>';
        // 读取文件
        var file = files[0];
        var reader = new FileReader();
        reader.onload = (function(theFile) {
            return function(e) {
                readLaserFile(e.target.result);
            };
        })(file);


        reader.readAsDataURL(file);
        // console.log(laserData);
    }

    // 质谱点击回调
    function clickHandleMappingFileSelect(evt) {
        var files = evt.target.files; // FileList object

        // files is a FileList of File objects. List some properties.
        var output = [];
        // var f = files[0];
        // output.push('<li><strong>', escape(files[0].name), '</strong> (', files[0].type || 'n/a', ') - ',
        //     files[0].size, ' bytes, last modified: ',
        //     files[0].lastModifiedDate ? files[0].lastModifiedDate.toLocaleDateString() : 'n/a',
        // '</li>');
        for (var i = 0, f; f = files[i]; i++) {
            output.push('<li><strong>', f.name, '</strong></li>');
        }
        document.getElementById('mappingfilename').innerHTML = '<ul>' + output.join('') + '</ul>';
        // 读取文件
        var file = files[0];
        var reader = new FileReader();
        reader.onload = (function(theFile) {
            return function(e) {
                readMappingFile(e.target.result);
            };
        })(file);


        reader.readAsDataURL(file);
        // console.log(laserData);
    }


    // Setup the dnd listeners.
    var laserdropZone = document.getElementById('dragbut1');
    var laserdropInput = document.getElementById('dragInput1');
    var mappingdropZone = document.getElementById('mappingdragzone');
    var mappingdropInput = document.getElementById('mappingdragInput');
    laserdropZone.addEventListener('dragover', handleDragOver, false);
    laserdropZone.addEventListener('drop', handleFileSelect, false);
    // dropZone.addEventListener('click', clickHandleFileSelect, false);
    laserdropInput.addEventListener('change', clickHandleFileSelect, false);

    // 质谱文件拖曳监听
    mappingdropZone.addEventListener('dragover', handleDragOver, false);
    mappingdropZone.addEventListener('drop', handleMappingFileSelect, false);
    // dropZone.addEventListener('click', clickHandleFileSelect, false);
    mappingdropInput.addEventListener('change', clickHandleMappingFileSelect, false);

    // d3读取结束
    // upload.render({ //允许上传的文件后缀
    //     elem: '#test4'
    //     ,url: '/upload/'
    //     ,accept: 'file' //普通文件
    //     ,exts: 'zip|rar|7z' //只允许上传压缩文件
    //     ,done: function(res){
    //         console.log(res)
    //     }
    // });
    // //选完文件后不自动上传
    // upload.render({
    //     elem: '#test8'
    //     ,url: '/upload/'
    //     ,accept: 'file' //普通文件
    //     ,exts: 'csv' //只允许上传压缩文件
    //     ,drag : true
    //     ,auto: false
    //     //,multiple: true
    //     ,bindAction: '#test9'
    //     ,done: function(res){
    //         console.log(res)
    //     }
    // });
    //
    // //拖拽上传
    // var filename;
    // upload.render({
    //     elem: '#test10'
    //     ,url: '/upload/'
    //     ,accept: 'file' //普通文件
    //     ,exts: 'csv' //只允许上传压缩文件
    //     ,auto: false
    //     ,bindAction: '#test9'
    //     ,choose: function (obj) {
    //         // console.log(obj);
    //         var files = obj.pushFile();
    //         // console.log(files);
    //         filename = files.getname;
    //
    //         d3.dsv(",", files[0], function(d) {
    //
    //             return {
    //                 // year: new Date(+d.Year, 0, 1), // convert "Year" column to Date
    //                 // make: d.Make,
    //                 // model: d.Model,
    //                 // length: +d.Length // convert "Length" column to number
    //                 time: +d.Time1
    //             };
    //         }).then(function(data) {
    //             // return data
    //             // for(var i=0; i<data.length; i++){
    //             //     var year = data[i].year
    //             //     console.log(year);
    //             // }
    //             console.log(data);
    //         });
    //         // obj.preview(function (file) {
    //         //     console.log(file.name)
    //         // });
    //         // console.log('aaa')
    //     }
    //     ,before: function (obj) {
    //         console.log('ddd')
    //     }
    //     ,done: function(res){
    //         console.log(res)
    //     }
    // });

    // $('.site-demo-active').on('click', function(){
    //     var othis = $(this), type = othis.data('type');
    //     active[type] ? active[type].call(this, othis) : '';
    // });
    // $(function () {
    //     $(window).unbind('beforeunload');
    //     window.onbeforeunload = null;
    // });
    // 读取激光和质谱数据并做初始计算
    var velocity=[];
    var spotsize=[];
    // var StanOfMappingList = [];
    $(document).on('click', '#readLaserAndMassButton', function () {
        // layer.msg("hello");
        // var index = layer.load(2, {time: 10*1000}); //又换了种风格，并且设定最长等待10秒
        // var calculating = layer.msg('计算中... ...')
        // layer.tips('计算中...', '#id', {
        //     tips: 1
        // });
        // var calculatingIcon = layer.load(1, {content: '计算中...', scrollable: false, shade: 0.3});

        var calculatingIcon = layer.load(1, { //icon支持传入0-2
            shade: [0.3, 'gray'], //0.5透明度的灰色背景
            content: '计算中...',
            success: function (layero) {
                layero.find('.layui-layer-content').css({
                    'padding-top': '39px',
                    'width': '60px'
                });
            }
        });

        // 开始计算
        // console.log(typeof mappingData);
        // console.log(typeof laserData);

        if (MassSpectrum && laserData)
        {
            // console.log(laserData);

            // 读激光
            // console.log(mappingData);
            for (var i=0; i<laserData.length; i++)
            {
                LaserLog.LaserTimeStr.push(laserData[i][laserDataColumns[0]]);
                LaserLog.LaserComment.push(laserData[i][laserDataColumns[4]]);
                LaserLog.LaserOnOff.push(laserData[i][laserDataColumns[10]]);
                // LaserLog.LaserOnOff.push(laserData[i][laserDataColumns[10]]);
                velocity.push(laserData[i][laserDataColumns[9]]);
                spotsize.push(laserData[i][laserDataColumns[13]]);
                LaserLog.LaserAllX.push(laserData[i][laserDataColumns[5]]);
                LaserLog.LaserAllY.push(laserData[i][laserDataColumns[6]]);
                LaserLog.LaserIntendedX.push(laserData[i][laserDataColumns[7]]);
                LaserLog.LaserIntendedY.push(laserData[i][laserDataColumns[8]]);
                // LaserLog.LaserOnOff.push(laserData[i][laserDataColumns[10]]);


            }
            LaserLog.LaserVelocity = Math.max.apply(null, velocity);
            LaserLog.LaserSpotSize = Math.max.apply(null, spotsize);
            // 时间字符串转换数字
            LaserLog.LaserTimeStr.forEach(getNumOfTimeStr);
            LaserLog.LaserTimeSec = timesec;
            LaserLog.LaserBeginTimeStr = laserData[0][laserDataColumns[0]];
            LaserLog.LaserEndTimeStr = laserData[laserData.length-1][laserDataColumns[0]];
            LaserLog.LaserFirstTimeSec = timesec[0];
            LaserLog.LaserLastTimeSec = timesec[timesec.length-1];
            LaserLog.LaserOnOff.forEach(getNumOfoffon);
            LaserLog.LaserONOffNumber = tempoffonnumber;
            // 未修改
            LaserLog.LaserIntendedXNoNone = 0;
            LaserLog.LaserIntendedYNoNone = 0;
            LaserLog.LaserIntendedXYtime = 0;
            // 获得每条线
            var timeOnsec = [];
            var timeOffsec = [];
            var xOn = [];
            var yOn = [];
            var xOff = [];
            var yOff = [];
            var tempstanname = [];
            for (i=0; i<tempoffonnumber.length; i++) {
                if (tempoffonnumber[i+1] > tempoffonnumber[i]) {
                    timeOnsec.push(timesec[i+1]);
                    xOn.push(LaserLog.LaserAllX[i]);
                    yOn.push(LaserLog.LaserAllY[i])
                } else if (tempoffonnumber[i] > tempoffonnumber[i+1]) {
                    timeOffsec.push(timesec[i+1]);
                    xOff.push(LaserLog.LaserAllX[i]);
                    yOff.push(LaserLog.LaserAllY[i])
                }

                // 提取表样起始信息
                if (LaserLog.StandardSamName.includes(LaserLog.LaserComment[i])) {
                    tempstanname.push(LaserLog.LaserComment[i])
                }
            }

            // 提取前后的时间和xy
            var stanN = tempstanname.length;
            var stanN2 = parseInt(stanN/2);
            // var stanN2 = parseInt(stanN2);
            var stanbeginsec = [];
            var stanendsec = [];
             // 标样为一个点，位置不变
            var stanX = [];
            var stanY = [];
            for (var sta=0; sta<stanN2; sta++) {
                stanbeginsec.push(timeOnsec[sta]);
                stanendsec.push(timeOffsec[sta]);
                stanX.push(xOn[sta]);
                stanY.push(yOn[sta])
            }
            for (sta=timeOnsec.length-stanN2; sta<timeOnsec.length; sta++) {
                stanbeginsec.push(timeOnsec[sta]);
                stanendsec.push(timeOffsec[sta]);
                stanX.push(xOn[sta]);
                stanY.push(yOn[sta])
            }
            // var StanOfMappingList = [];
            var StanOfMapping;
            for (sta=0; sta<tempstanname.length; sta++) {
                StanOfMapping = {
                    Name : tempstanname[sta],
                    BeginSec : stanbeginsec[sta],
                    EndSec : stanendsec[sta],
                    X : stanX[sta],
                    Y : stanY[sta]
                };

                LaserLog.StanOfMappingList.push(StanOfMapping)
            }

            LaserLog.LaserXYOn = [xOn, yOn];
            LaserLog.LaserXYOff = [xOff, yOff];
            LaserLog.LaserTimeOn = timeOnsec;
            LaserLog.LaserTimeOff = timeOffsec;
            // 全部线信息，无单点
            LaserLog.LaserLineBeginTimeSec = timeOnsec.slice(stanN2, -stanN2);
            LaserLog.LaserLineEndTimeSec = timeOffsec.slice(stanN2, -stanN2);
            LaserLog.LaserLineBeginXY = [xOn.slice(stanN2, -stanN2), yOn.slice(stanN2, -stanN2)];
            LaserLog.LaserLineEndXY = [xOff.slice(stanN2, -stanN2), yOff.slice(stanN2, -stanN2)];

            // 将信号密集化

            var intensivetimematrix = math.range(timesec[0], timesec[timesec.length-1],100);
            var intensivetime = intensivetimematrix["_data"];
            var intensivesignal = math.zeros([intensivetime.length]);
            for (var signal=0; signal<intensivesignal.length; signal++) {
                for (var timeoni=0; timeoni<timeOnsec.length; timeoni++) {
                    if (intensivetime[signal] >= timeOnsec[timeoni] && intensivetime[signal] <= timeOffsec[timeoni]) {
                        intensivesignal[signal] = 1;
                    }
                }
            }
            LaserLog.LaserIntensiveONOffNumber = intensivesignal;
            LaserLog.LaserIntensiveONOffTime_0_1s = intensivetime;

            // 提取背景起始信息
            var StanBegin = [];
            var StanEnd = [];
            for (var stani=0; stani<LaserLog.StanOfMappingList.length; stani++) {
                StanBegin.push(LaserLog.StanOfMappingList[stani].BeginSec);
                StanEnd.push(LaserLog.StanOfMappingList[stani].EndSec);
            }
            var BGwidth = LaserLog.BackgroundWidth;

            var tempBGBegin = [];
            var tempBGEnd = [];
            // 第一个背景的开始

            tempBGBegin.push(StanBegin[0] - BGwidth) +1000;
            stanN = StanBegin.length;
            stanN2 = parseInt(stanN/2);
            stani = 0;
            for (var stanindex=0; stanindex<StanBegin.length; stanindex++) {
                if (stani === stanN2) {
                    tempBGEnd.push(StanEnd[stani-1] + BGwidth);
                    tempBGBegin.push(StanBegin[2] - BGwidth);
                }
                tempBGEnd.push(StanBegin[stanindex]);
                tempBGBegin.push(StanEnd[stanindex]);
                stani = stani + 1;
            }

            // 激光不记录最后一个背景的结束时间，所以根据设定的背景时长外推
            // 最后一个背景
            tempBGEnd.push(StanEnd[StanEnd.length-1] + BGwidth - 1000);
            LaserLog.LaserBackgroundTime = [tempBGBegin, tempBGEnd];

            // 激光读取计算结束

            // 读取质谱文件开始
            // 第3行
            //     ['Acquired      : 2016/7/20 14:58:22 using Batch JULY20A-GARTNET.b']
            //     [16:34]
            // ['Time [Sec]', 'Li7', 'B11', 'Na23', 'Mg25', 'Al27', 'Si29', 'P31', 'K39', 'Ca42', 'Sc45', 'Ti49', 'V51', 'Cr53', 'Mn55', 'Fe57', 'Co59', 'Ni60', 'Cu63',
            //     ['0.6642', '500.01', '500.01', '83932.42', '0.00', '700.02', '69560.38', '19312.40', '55101.39', '4700.74', '0.00', '0.00', '100.00', '300.00', '10003
            MassSpectrum.EleCount = mappingDataColumns.length - 1;
            for (i=0; i<MassSpectrum.EleCount; i++) {
                MassSpectrum.AllEleCps.push([]);
            }

            for (i=0; i<mappingData.length; i++) {
                MassSpectrum.MassTimeSecFromZero.push(mappingData[i][mappingDataColumns[0]] * 1000);
                MassSpectrum.MassTimeSec.push((mappingData[i][mappingDataColumns[0]] + 0)  * 1000);
                // MassSpectrum.AllEleCps.push(mappingData[i][mappingDataColumns[0]] + 0);
                for (var elei=0; elei<MassSpectrum.EleCount; elei++) {
                    // 每一行是一个元素
                    MassSpectrum.AllEleCps[elei].push(mappingData[i][mappingDataColumns[elei+1]]);
                }
            }
            // 调整表样元素数据顺序
            MassSpectrum.StandardSamName = 'SRM 610';
            var mass_ele_name_list = MassSpectrum.ElementsName;
            var standardcsv_new_order = [];
            if (mass_ele_name_list) {
                var standard_sam_name = MassSpectrum.StandardSamName;
                var one_standard_all_ele_data_dict = standardName_Ele_PPM_Dict[standard_sam_name];
                // # 国际标样csv中内标的ppm
                for (elei=0; elei<mass_ele_name_list.length; elei++) {
                    standardcsv_new_order.push(one_standard_all_ele_data_dict[mass_ele_name_list[elei]]);
                }

                MassSpectrum.StandardcsvPPM_new_order = standardcsv_new_order;

            }

            // 调整时间
            // 所有元素cps相加
            var sumEleCps = [];
            // 循环所有行
            for (var rowi=0; rowi<MassSpectrum.AllEleCps[0].length; rowi++) {
                // 循环所有元素
                var tempCps = 0;
                for (elei=0; elei<MassSpectrum.EleCount; elei++) {
                    tempCps = tempCps + MassSpectrum.AllEleCps[elei][rowi];
                }
                sumEleCps.push(tempCps)
            }

            // 隔0.1s 100ms 插值
            var intensiveMassTimesFromZero = math.range(MassSpectrum.MassTimeSecFromZero[0], MassSpectrum.MassTimeSecFromZero[MassSpectrum.MassTimeSecFromZero.length-1],100);
            intensiveMassTimesFromZero = intensiveMassTimesFromZero["_data"];

            var intensiveMassCps = linearInterp(MassSpectrum.MassTimeSecFromZero, sumEleCps,intensiveMassTimesFromZero);
            // 计算漂移量  漂移量默认小于60 000ms  LaserLog.LaserIntensiveONOffNumber = intensivesignal;
            //                                      LaserLog.LaserIntensiveONOffTime_0_1s = intensivetime;
            var offmax = [];
            if (intensiveMassCps.length >= intensivesignal.length) {
                for (var offi=0; offi<intensiveMassCps.length-intensivesignal.length+1; offi++) {
                    offmax.push(getMaxOfMassAndLaser(intensiveMassCps, intensivesignal, offi));
                }

                // 从最大值中求最大值
                var maxoffmax = Math.max.apply(null, offmax);
                var maxoffmaxindex = offmax.indexOf(maxoffmax);
                // 保存为毫秒
                MassSpectrum.MassTimeOffset = maxoffmaxindex * 100 + MassSpectrum.MassTimeSec[0];
                // 不能进行广播相乘
                MassSpectrum.MassTimeSecAdjusted = math.add(MassSpectrum.MassTimeSecFromZero, LaserLog.LaserFirstTimeSec);
                // MassSpectrum.MassTimeSecAdjusted = math.subtract(MassSpectrum.MassTimeSecAdjusted, MassSpectrum.MassTimeOffset);
                MassSpectrum.MassTimeSecAdjusted = math.subtract(MassSpectrum.MassTimeSecAdjusted, MassSpectrum.MassTimeOffset);
                MassSpectrum.IsTimeAdjusted = true;

                // 去背景
                var bgcps = [];
                var bgtimesegmentmean = [];
                var bgtimeofcps = [];
                for (i=0; i<LaserLog.LaserBackgroundTime[0].length; i++) {
                    bgcps.push([]);
                    // bgtimesegmentmean.push([]);
                    for (elei=0; elei<MassSpectrum.EleCount; elei++) {
                        bgcps[i].push([]);
                        // bgtimesegmentmean[i].push([]);
                    }

                    bgtimeofcps.push([])
                }
                // for (i=0; i<LaserLog.LaserBackgroundTime[0].length; i++) {
                //     bgtimeofcps.push([])
                // }

                if (!MassSpectrum.IsSubBg) {
                    // LaserLog.LaserBackgroundTime;
                    // 循环所有cps行，挑出背景值
                    for (rowi=0; rowi<MassSpectrum.AllEleCps[0].length; rowi++) {
                        for (i=0; i<LaserLog.LaserBackgroundTime[0].length; i++) {
                            if ((MassSpectrum.MassTimeSecAdjusted[rowi] >= LaserLog.LaserBackgroundTime[0][i] + 1000) && (MassSpectrum.MassTimeSecAdjusted[rowi] <= LaserLog.LaserBackgroundTime[1][i] - 1000)) {

                                for (elei=0; elei<MassSpectrum.EleCount; elei++) {
                                    bgcps[i][elei].push(MassSpectrum.AllEleCps[elei][rowi]);

                                }
                                bgtimeofcps[i].push(MassSpectrum.MassTimeSecAdjusted[rowi])

                            }
                        }
                    }

                    for (i=0; i<bgcps.length; i++) {
                        // console.log(bgcps[i]);
                        bgtimesegmentmean.push(math.mean(bgcps[i], 1))
                    }
                    MassSpectrum.AllSegmentBgCps = bgcps;
                    MassSpectrum.AllSegmentBgTime = bgtimeofcps;
                    MassSpectrum.AllSegmentBgCpsMean = bgtimesegmentmean;
                    var tempmean = 0;
                    for (i=0; i<bgtimesegmentmean.length; i++) {
                        tempmean = math.add(bgtimesegmentmean[i], tempmean);
                    }
                    math.forEach(tempmean, function (currentvalue, index, arg) {
                        tempmean[index] = currentvalue / bgtimesegmentmean.length;
                    });
                    MassSpectrum.AllBgCpsMean = tempmean;
                    // 减背景  循环所有元素
                    for (elei=0; elei<MassSpectrum.EleCount; elei++) {
                        MassSpectrum.AllEleCpsSubBg.push([])
                    }
                    for (rowi=0; rowi<MassSpectrum.AllEleCps[0].length; rowi++) {
                        for (elei=0; elei<MassSpectrum.EleCount; elei++) {
                            MassSpectrum.AllEleCpsSubBg[elei].push(MassSpectrum.AllEleCps[elei][rowi] - MassSpectrum.AllBgCpsMean[elei]);
                        }
                    }
                    // 转置  暂无
                    MassSpectrum.IsSubBg = true;

                    // 提取前后标样的平均值以及平均值对应的时间点
                    var stanlist = LaserLog.StanOfMappingList;
                    var one_stan_in_mass_cps = [];
                    for (elei=0; elei<MassSpectrum.EleCount; elei++) {
                        one_stan_in_mass_cps.push([]);
                    }

                    if (MassSpectrum.StandardSamName) {
                        for (stani=0; stani<stanlist.length; stani++) {
                            if (stanlist[stani].Name === MassSpectrum.StandardSamName) {

                                math.forEach(MassSpectrum.MassTimeSecAdjusted, function (currentvalue, index, arg) {

                                    if ((currentvalue > stanlist[stani].BeginSec + 1000) &&(currentvalue < stanlist[stani].EndSec- 1000)) {
                                        for (elei=0; elei<MassSpectrum.EleCount; elei++) {
                                            one_stan_in_mass_cps[elei].push(MassSpectrum.AllEleCpsSubBg[elei][index]);

                                        }
                                    }
                                });
                                var one_stan_in_mass_cps_mean = math.mean(one_stan_in_mass_cps,1);
                                MassSpectrum.StanCpsMeanFrontAndBack.push(one_stan_in_mass_cps_mean);
                                var middleSec = (stanlist[stani].BeginSec + stanlist[stani].EndSec) / 2;
                                MassSpectrum.StanCpsMeanFrontAndBackOfTiemSec.push(middleSec);
                            } else {
                                console.log(stanlist[stani].Name + '不是选择的标样！')
                            }
                            // 标样段求平均

                        }
                        MassSpectrum.StanCpsMeanFrontAndBackToOneArray = math.mean(MassSpectrum.StanCpsMeanFrontAndBack, 0);
                    } else {
                        console.log('未设置标样名称！')
                    }
                }
                // 前后表样段求平均
                // 计算所有元素cps除以内标元素的cps
                // 未传入内标的序号
                MassSpectrum.IntEle = 'Ca42';
                MassSpectrum.IndexIntEle_InGrid = 8;
                if (MassSpectrum.IntEle) {
                    var inter_cps_samplt = MassSpectrum.AllEleCpsSubBg;
                    var elements_name = MassSpectrum.ElementsName;
                    var inter_ele_name = MassSpectrum.IntEle;
                    var inter_ele_index = MassSpectrum.IndexIntEle_InGrid;
                    var inter_ele_cps = MassSpectrum.AllEleCpsSubBg[inter_ele_index];

                    // 深拷贝
                    var cps_ratio_devide_interele = [];
                    for (elei=0;elei<MassSpectrum.EleCount; elei++) {
                        cps_ratio_devide_interele.push([]);
                    }

                    // var cps_ratio_devide_interele = MassSpectrum.AllEleCpsSubBg;
                    for (elei=0; elei<MassSpectrum.EleCount; elei++) {
                        cps_ratio_devide_interele[elei] = math.dotDivide(MassSpectrum.AllEleCpsSubBg[elei], MassSpectrum.AllEleCpsSubBg[inter_ele_index])
                    }

                    MassSpectrum.RatioAllEleandInteraEle = cps_ratio_devide_interele;
                }
                // 计算并网格化
                // 计算标样csv中的ppm与内标的比值
                // 计算标样csv中的所有元素除以内标元素 行向量
                if (MassSpectrum.IntEle) {
                    math.forEach(MassSpectrum.StandardcsvPPM_new_order, function (currentvalue, index, arg) {
                        MassSpectrum.StandardcsvPPM_new_order_Ratio.push(currentvalue / standardName_Ele_PPM_Dict[MassSpectrum.StandardSamName][MassSpectrum.IntEle])
                    })
                }
                // 根据两头的实测的标样的cps与内标比值，插值出质谱每行的标样cps比值，即假定的每个点的标样cps
                if (MassSpectrum.IntEle) {
                    // 两头标样cps与内标cps比值
                    for (stani=0; stani<MassSpectrum.StanCpsMeanFrontAndBack.length; stani++) {
                        MassSpectrum.StanCpsMeanIntEleRatioFrontAndBack.push([])
                    }
                    for (stani=0; stani<MassSpectrum.StanCpsMeanFrontAndBack.length; stani++) {
                        math.forEach(MassSpectrum.StanCpsMeanFrontAndBack[stani], function (currentvalue, index, arg) {
                            MassSpectrum.StanCpsMeanIntEleRatioFrontAndBack[stani].push(currentvalue / MassSpectrum.StanCpsMeanFrontAndBack[stani][MassSpectrum.IndexIntEle_InGrid])
                        })
                    }
                    // # 插值出所有行
                    // # 拼贴前后标样数据
                    for (elei=0; elei<MassSpectrum.EleCount; elei++) {
                        MassSpectrum.StanRatioInMassDriftAllTime.push([])
                    }
                    // data = np.vstack(tuple(self.StanCpsMeanIntEleRatioFrontAndBack))
                    for (elei=0; elei<MassSpectrum.EleCount; elei++) {
                        MassSpectrum.StanRatioInMassDriftAllTime[elei] = linearInterp([MassSpectrum.StanCpsMeanFrontAndBackOfTiemSec[0], MassSpectrum.StanCpsMeanFrontAndBackOfTiemSec[1]], [MassSpectrum.StanCpsMeanIntEleRatioFrontAndBack[0][elei], MassSpectrum.StanCpsMeanIntEleRatioFrontAndBack[1][elei]], MassSpectrum.MassTimeSecAdjusted);
                    }
                }
                // 单内标PPM  PPM = 内标PPM * CPS内标比值 * 标样CSVPPM比值 / 标样cps比值插值（所有行）
                MassSpectrum.IntElePpm = 500000;
                if (MassSpectrum.IntElePpm) {
                    var IntElePpmArray = [];
                    var StandardcsvPPM_new_order_Ratio_Array = [];


                    for (elei = 0; elei < MassSpectrum.EleCount; elei++) {
                        IntElePpmArray.push([]);
                        StandardcsvPPM_new_order_Ratio_Array.push([])
                    }
                    for (elei = 0; elei < MassSpectrum.EleCount; elei++) {
                        for (rowi = 0; rowi < MassSpectrum.RatioAllEleandInteraEle[0].length; rowi++) {
                            IntElePpmArray[elei].push(MassSpectrum.IntElePpm);
                            StandardcsvPPM_new_order_Ratio_Array[elei].push(MassSpectrum.StandardcsvPPM_new_order_Ratio[elei]);
                        }
                    }
                    MassSpectrum.AllElePpmInterEle = math.dotMultiply(IntElePpmArray, MassSpectrum.RatioAllEleandInteraEle);
                    MassSpectrum.AllElePpmInterEle = math.dotMultiply(MassSpectrum.AllElePpmInterEle, StandardcsvPPM_new_order_Ratio_Array);
                    MassSpectrum.AllElePpmInterEle = math.dotDivide(MassSpectrum.AllElePpmInterEle, MassSpectrum.StanRatioInMassDriftAllTime);


                } else {
                    console.log('没有内标值')
                }
                // 半定量ppm，不使用内标的ppm
                var tempmul = math.dotDivide(MassSpectrum.StandardcsvPPM_new_order, MassSpectrum.StanCpsMeanFrontAndBackToOneArray);
                var tempmulArray = [];
                for (elei = 0; elei < MassSpectrum.EleCount; elei++) {
                    tempmulArray.push([]);
                }
                for (elei = 0; elei < MassSpectrum.EleCount; elei++) {
                    for (rowi = 0; rowi < MassSpectrum.RatioAllEleandInteraEle[0].length; rowi++) {
                        tempmulArray[elei].push(tempmul[elei]);
                    }
                }
                MassSpectrum.SemiPpm = math.dotMultiply(MassSpectrum.AllEleCpsSubBg, tempmulArray);
                // 网格化cps
                // 把所有的数据网格化

                if (MassSpectrum.IntElePpm) {
                    var linebegintime = LaserLog.LaserLineBeginTimeSec;
                    var lineendtime = LaserLog.LaserLineEndTimeSec;
                    var linebegin_xy = LaserLog.LaserLineBeginXY;
                    var lineend_xy = LaserLog.LaserLineEndXY;
                    var cps = MassSpectrum.AllEleCpsSubBg;
                    var ppm = MassSpectrum.AllElePpmInterEle;
                    var semippm = MassSpectrum.SemiPpm;

                    // # 去掉背景段的cps
                    var mappingcps = [];
                    // # 去掉背景ppm等
                    var mappingppm = [];
                    var mappingsemippm = [];
                    var eleCount = MassSpectrum.EleCount;
                    var time = MassSpectrum.MassTimeSecAdjusted;
                    // # 面扫速度
                    var scanV = LaserLog.LaserVelocity / 1000;
                    var newxlist = [];
                    var newylist = [];
                    // # 循环各条线，构建cps值对应x y
                    for (elei=0; elei<MassSpectrum.EleCount; elei++) {
                        mappingcps.push([]);
                        mappingppm.push([]);
                        mappingsemippm.push([]);
                    }
                    for (var lineIndex=0; lineIndex<linebegintime.length; lineIndex++) {
                        var onlinetime = [];

                        math.forEach(time, function (currentvalue, index, arg) {
                            if (currentvalue >= linebegintime[lineIndex] && currentvalue <= lineendtime[lineIndex]) {
                                onlinetime.push(currentvalue);

                                for (elei=0; elei<MassSpectrum.EleCount; elei++) {
                                    // 挑cps
                                    mappingcps[elei].push(cps[elei][index]);
                                    // 挑ppm
                                    mappingppm[elei].push(ppm[elei][index]);
                                    // 挑semippm
                                    mappingsemippm[elei].push(semippm[elei][index]);
                                }
                            }
                        });
                        var onlinetimeD = math.subtract(onlinetime, linebegintime[lineIndex]);
                        math.forEach(onlinetimeD, function (currentvalue1, index1, arg1) {
                            newxlist.push(currentvalue1 * scanV + linebegin_xy[0][lineIndex]);
                            newylist.push(linebegin_xy[1][lineIndex])
                        });
                        // var dx = onlinetimeD * scanV + linebegin_xy[0][lineIndex];

                        // newxlist.push(onlinetimeD);
                        // newylist.push(math.add(math.subtract(onlinetimeD, onlinetimeD), linebegin_xy[1][lineIndex]));
                    }
                    // 自定义线性平行插值,按速度插值
                    // 找出x最大最小，找出y的最大最小，先插值出网格，然后按平行线插值zValues
                    var xmax = math.max(newxlist);
                    var xmin = math.min(newxlist);
                    var ymax = math.max(newylist);
                    var ymin = math.min(newylist);
                    // 求出x的间隔

                    var linei=0;
                    var firsty = newylist[0];
                    var lineendindex = [];
                    var linestartindex = [];
                    linestartindex.push(0);
                    for (rowi=0; rowi<newxlist.length; rowi++) {
                        if (newylist[rowi] !== firsty) {
                            linestartindex.push(rowi);
                            lineendindex.push(rowi-1);
                            firsty = newylist[rowi];
                        }
                    }
                    lineendindex.push(newylist.length-1);

                    var stepline=0;
                    // for (rowi=linestartindex[1]; rowi<lineendindex[1]; rowi++) {
                    //     // sum = sum + newxlist[rowi];
                    // }
                    stepline = (newxlist[lineendindex[1]] - newxlist[linestartindex[1]]) / (lineendindex[1] - linestartindex[1]);
                    // sum为x的间隔
                    var xx = math.range(xmin, xmax, stepline, true);
                    xx = xx['_data'];
                    var yy = math.range(ymin, ymax, stepline, true);
                    yy = yy['_data'];
                    for (elei=0; elei<MassSpectrum.EleCount; elei++) {
                        MassSpectrum.AllEleCpsGrid.push([]);
                        for (linei=0; linei<linestartindex.length; linei++) {
                            MassSpectrum.AllEleCpsGrid[elei].push([])
                        }
                    }



                    for (elei=0; elei<MassSpectrum.EleCount; elei++) {
                        for (linei=0; linei<linestartindex.length; linei++) {
                            MassSpectrum.AllEleCpsGrid[elei][linei]= linearInterp(newxlist.slice(linestartindex[linei], lineendindex[linei]+1), mappingcps[elei].slice(linestartindex[linei], lineendindex[linei]+1), xx);
                        }
                    }




                }
                elei = 0;
            } else {
                return '质谱长度不应小于信号长度'
            }



            var xe = Array.from(new Array(96).keys()).slice(0);
            var ye = xe;
            var zValues = [[76812.6576104698,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN],
                [53230.9959339797,56707.96873,59835.97134,65175.35729,67958.47251,67840.89038,65805.52519,66719.71903,67611.22391,64499.95183,61598.06492,60916.72231,60508.72039,53949.81234,47355.32854,51107.36581,53674.86553,53167.92568,52404.39963,49093.89199,45787.03971,49448.89478,52749.66631,54264.8505,55783.06516,56135.21339,56525.23697,58637.56922,60868.16685,58469.17688,55798.08461,65047.94284,74543.02803,71267.5339,68243.37188,66849.03115,65970.15093,61138.54055,56667.76293,57174.57147,59909.31141,58140.90073,55796.5752,54126.37843,53062.58412,52693.80009,52683.47463,49331.46386,46182.78189,46516.41428,46917.98264,48095.68647,48745.96322,49592.57719,53587.85973,57313.58212,57567.76228,56265.73368,54856.99353,53582.68882,53047.52724,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,79297.06092,55317.06945,38056.54818,NaN,NaN,NaN,NaN],
                [56262.0375420054,56908.53476,57556.52101,63205.71623,68901.79834,70150.17613,71357.60328,67706.02226,63924.59871,59700.25866,57257.68368,59677.90179,61784.2898,54406.18484,47556.93799,51419.89726,54156.82867,54498.44458,53299.35167,50175.92917,49895.34851,50836.18683,53328.17577,55250.33304,57514.36035,58128.74219,55702.74414,57157.89415,58522.23667,58751.68405,59657.50045,72428.5596,87178.68768,77965.56037,65840.86757,62175.00045,59625.19027,54923.03646,50223.21575,50570.2885,50915.63363,52271.83591,54674.48758,52858.44639,51260.12062,49575.42896,47808.6372,46042.45526,45513.10281,45794.4028,46238.34787,45914.6076,45592.46877,44803.35312,43884.66157,42596.99529,41447.3011,44500.1643,48298.9562,48590.54966,48172.18731,51821.03874,54294.05726,50238.20754,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN],
                [59420.3332936621,64702.32102,69173.96127,68127.69235,67219.56475,67263.48512,67254.90927,61883.17627,56512.34803,55609.39967,55705.18499,57007.19059,58100.36325,53845.20731,49973.8506,48237.67251,46315.70427,49864.23355,53486.50914,55589.14072,57488.62779,55227.87493,52845.0101,52893.73067,52861.26715,53917.78788,55147.42081,57397.09421,58939.99127,64079.26181,68961.51491,73797.75115,77546.8484,67872.50424,60027.69941,57885.20779,58361.67898,53472.27358,50417.14257,51493.57818,52375.63422,53296.73582,53570.07753,51112.75964,48413.43445,48707.45833,49698.33005,47482.93329,45900.60506,47326.66021,48934.32537,47965.7843,47528.96429,48998.56414,50480.90526,47519.54104,44108.67559,44297.48951,44724.76788,45380.15411,45121.87766,46527.00451,45839.61246,43537.37993,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN],
                [58717.2677059551,63165.37658,67559.0301,67482.9072,68791.0667,65689.35878,62469.01152,58477.00584,54388.36629,52034.24601,49614.31475,55938.4596,62710.04299,56800.07639,50734.15383,47632.71298,45399.93017,49587.72104,53675.61209,57002.9618,60329.29614,58508.86902,57063.63763,58932.58557,60799.58998,61732.17266,62650.29996,62726.53017,62024.47709,67222.14942,72242.11457,69803.79335,68736.25296,63857.4783,59222.77573,58086.38739,56701.34413,53021.03308,49424.90285,51415.41896,52839.09647,49341.548,47634.06322,47790.43091,48191.13964,48957.13264,49693.56754,51199.1173,52674.09415,50742.16941,48730.06835,48598.6275,48255.75189,48880.94945,51685.83259,51040.10671,50921.72461,49329.90597,47862.27556,48825.80546,48904.19825,47317.15612,45244.05806,45495.58299,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN],
                [56794.2031397294,62410.91787,67780.71517,68066.23907,68430.0911,61328.35651,54204.60316,51726.378,49187.42399,52420.51861,54842.36921,59730.78095,65250.95603,56755.02253,49646.33802,47500.29348,47365.83053,48426.24682,50924.76885,55054.31015,60896.79892,61653.41126,62434.67238,62855.63877,62624.6171,60817.74956,59483.15533,65675.51909,71415.63054,74871.12299,76765.05583,68832.14885,60522.77345,56982.41751,52615.86866,52830.25102,53234.45677,49546.38992,45931.32286,50441.22143,55039.79926,52605.0303,48338.2942,48408.1435,50050.59837,51733.53224,52538.2225,53231.99678,53079.94705,51316.56468,48491.03079,48101.84315,47936.15925,52473.49022,54527.37625,50072.71443,46956.27972,46459.57331,46207.3762,46048.54768,46217.41489,46674.71427,47346.31903,47399.15163,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN],
                [58240.775151496,61335.4544,67260.28594,67736.38101,68208.21269,56385.51939,44559.27506,52169.80999,61202.55913,59891.32663,58697.20547,59454.97422,61524.49827,58735.26716,54592.05642,50305.58997,46464.84684,50554.14575,55388.66496,62512.97504,69268.11905,67083.56173,64617.99474,62003.8736,62234.24206,61739.93865,59778.54582,69815.50814,78800.2706,69729.3247,63232.23383,59004.08329,54230.79227,53543.46038,50369.97836,52078.98001,52955.48821,53207.10398,52862.53544,53500.38973,54713.09774,55814.48334,57002.26926,56771.65793,57108.06479,56096.49445,54649.5851,58417.69251,60754.41124,56607.11088,50979.0373,49906.3925,49132.17656,52153.40661,55134.15933,52536.32777,49479.47264,49152.9392,50096.89715,49409.00214,49209.3342,49385.1395,49206.33418,48214.48585,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN],
                [58721.8934178304,62760.85635,66938.00993,67329.19422,68123.64115,58001.78854,48345.88678,55847.93431,62910.9878,61222.94228,59526.57942,61369.18029,63634.2329,58631.73804,53638.13847,51957.30565,50660.26864,52315.86338,54439.33682,61465.85928,68784.72443,66052.64918,62873.40979,61434.38974,60059.85109,61123.38021,62206.18561,66529.33156,70531.60358,64287.50913,58886.3827,56668.0175,53647.43218,52026.98346,50074.02115,50566.5526,51189.58498,52921.27075,54902.46046,56739.76066,60212.84553,58711.9416,57060.50247,59603.41561,61013.60895,59402.1491,57573.13016,58112.86481,58720.48904,55432.37386,52200.89974,54267.80149,56373.77714,55323.22721,55287.03012,54357.77784,51639.26691,50740.27903,50735.01871,49099.90373,48248.11534,50302.59571,52264.04256,50270.23795,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN],
                [56543.0496383249,65440.14291,74190.77711,68989.26771,63610.14519,61517.57684,59421.24418,60213.94897,60925.37293,59594.879,56190.5332,61805.29974,66185.32252,61335.79522,56385.29563,57712.94198,59702.37436,57417.02088,57725.74302,60748.43407,66146.32345,60715.71642,57368.14649,60300.8379,65184.82196,66512.6719,68517.34361,64465.2693,61746.71068,58278.75581,55333.23624,53702.58408,51943.19515,51489.20948,50809.21726,52822.49539,54766.17975,55777.08487,56688.6653,56614.75378,56552.29312,56630.84095,55428.31566,58243.08577,60393.60839,58434.91597,54863.12497,56216.05927,57720.7158,55901.87173,54180.93218,54501.76745,55946.03311,56454.66536,55884.87221,54919.72936,54828.33797,54133.74054,54053.59457,56089.99283,57216.83016,54917.78848,52002.94588,49569.19741,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN],
                [65457.0806139732,68034.72403,71762.01293,68220.73257,64516.05778,64154.89781,63560.65769,64252.73531,62872.89611,60567.50123,59011.21807,60252.02651,62621.95943,61796.4798,61133.83746,59930.83075,59572.07162,65401.64324,70835.59251,67813.74976,65281.07544,64018.58243,62799.87487,62841.9675,65545.35123,64072.53329,61550.14945,60059.56212,58466.49317,54675.77999,51280.19708,51367.20529,52314.52042,53090.69124,54185.20456,53871.80768,54423.66786,54796.12924,55400.57549,54597.68082,54119.82778,52600.95924,51850.89837,53921.13124,57080.00557,58169.5587,56541.63647,58465.60722,59575.34858,58763.5776,57068.22078,56109.56287,55529.9808,54417.85287,53323.5594,56167.74935,59054.50271,58291.03591,57082.08164,56839.6801,55947.9598,54396.91859,53764.62239,53856.42576,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,58568.05889,59145.83817,NaN,NaN,NaN],
                [68830.6281543456,69113.55498,69281.58045,66621.34404,62077.309,63567.30663,65359.65743,63207.80234,60954.88253,65331.72469,69449.30958,64241.60156,58220.42671,59943.00216,60999.74329,61049.58441,62353.28974,62696.0964,62808.5376,62700.89395,62464.16438,64274.62396,65677.94654,66199.27473,66634.95633,61259.0197,55838.28049,55583.24832,56602.18489,52225.18034,49491.28868,52394.38376,55194.01231,55184.98778,55260.60883,56227.14574,57246.29706,57247.35387,57161.37912,57822.23356,57180.98225,57475.55759,58095.05475,59349.04521,60796.23662,59191.87644,57558.57394,57369.23954,57148.16144,58409.56849,59652.67569,56900.22942,54130.42288,54200.69478,54656.88144,55838.10683,55584.46872,53929.28194,52311.62622,54256.55173,56141.77025,55728.80616,55193.76172,55579.97682,55747.03621,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,61906.02,57656.5093,55831.2541,57259.462,59739.55286,NaN],
                [71847.6175023031,69463.07555,66857.58602,66030.29694,65340.81024,66221.04222,67142.85702,66761.6324,66353.98015,66589.57221,65815.00808,64865.64431,61499.51258,61917.27261,63785.40331,64760.28495,66104.55972,66919.06767,65704.00303,66902.16984,65034.27965,62187.54401,59101.75853,58678.16484,58537.12316,57955.00526,57154.97194,56036.28696,55250.86729,49307.19044,44383.40952,51977.1497,59475.96865,58672.36238,58549.1521,57947.12534,57136.94436,59834.64744,62324.96254,61740.01367,60761.97997,60446.43455,59131.14436,58345.26551,59326.82762,58760.35332,57727.76448,57880.08122,59521.44989,58415.67259,56721.21723,57280.80643,56872.1238,54415.91594,52760.12106,54506.18209,55777.35722,54112.97696,52496.47964,54824.89462,56863.93891,55684.30485,53930.19388,55753.56309,56686.0111,61260.12946,NaN,NaN,NaN,NaN,NaN,NaN,NaN,53128.91894,50728.66077,52908.92877,55277.45228,58141.69411,61358.8995860559],
                [64201.8328691416,65765.604,66854.23512,67655.0664,68731.98842,67057.47992,65675.40467,65306.89412,66103.87772,64245.25002,62486.24356,62311.45531,62158.88969,63017.0375,64754.27094,67070.4892,69391.91048,67496.30665,64965.4198,63779.53568,62665.63714,60660.50195,58493.3975,55714.40721,55178.32729,56579.55856,58164.51401,57554.57986,55507.73491,46611.80137,41760.42246,49921.33206,61150.89473,58825.51292,58746.88591,57362.62145,58827.38813,60430.08037,61617.05196,60335.35188,60345.97125,63632.17772,66568.18161,63152.15667,59612.68849,58606.47654,58506.47756,59496.78673,60735.36139,59561.45906,58093.63469,57638.87816,57173.17764,55748.71593,54281.69821,53697.98768,53045.52676,52800.56279,53316.23981,53866.49211,54114.33503,53967.1545,54225.84613,51613.69471,48928.61877,54446.41711,59989.35101,NaN,NaN,NaN,NaN,NaN,NaN,50038.65014,54624.95644,52561.56423,50731.13312,52735.31042,54842.0009368955],
                [67744.1447274673,68514.56839,69307.80824,66495.96054,66695.77461,66297.42337,69513.18601,70298.53042,70451.9932,66533.67337,62306.05983,64194.196,65953.66145,67658.34169,69047.34262,69369.48211,69596.89195,65539.70417,61055.8084,64685.52191,67558.044,63373.07437,57812.18535,55500.33432,53388.91088,55836.8345,58341.30803,57801.49531,57008.41723,56100.85018,51108.94508,53882.61323,57577.0681,59402.35002,61356.91263,59695.37363,58031.55695,59034.66249,60044.27597,61637.77247,60900.38553,62601.86441,66005.29442,62356.27173,58572.80249,58829.50726,59090.30546,57431.77786,55776.31021,56326.91668,56833.97201,55847.71411,54785.88741,57322.89848,60502.37181,59423.12869,55742.84377,53759.10238,51568.86609,52762.15205,54123.16981,53603.72478,53237.88444,51110.14617,49238.49304,50876.65303,54450.98898,55364.27815,56877.90762,50918.19678,45411.87685,47651.78619,48359.62315,51217.75192,54292.72126,52572.06565,51563.60898,52304.02938,53069.5336748672],
                [70514.0905958589,71220.49964,71753.31121,72854.21467,73331.85514,71460.90259,69118.8061,68138.8516,67012.72245,66079.27225,65138.32227,65530.77375,65587.65661,66809.74966,68535.66449,66019.11731,64064.36099,62019.08907,60124.80507,63988.83263,67825.97574,60987.44116,54518.34925,54373.20108,54487.06137,55102.44831,55187.64412,59145.96726,62555.38579,63025.64341,62549.24478,62938.48933,62374.43432,61593.60906,60634.1709,60095.65097,58674.66423,57590.07082,57224.22522,57115.63767,57231.65701,58958.24181,62584.53317,60026.26114,56260.96722,56273.17141,56006.92531,55038.30973,55669.42664,53910.31949,53084.47487,53098.17227,53208.7789,53123.49758,53077.57206,55369.1669,56701.90082,56211.25587,54647.89377,53876.7315,53206.36695,51620.54357,49800.7258,50896.96743,52459.01323,51546.62284,50197.56391,49556.12486,49804.34387,46360.69287,45255.50412,44937.72062,45318.15304,50277.11189,55236.76721,52916.8002,50597.30955,50218.2697,50559.7155824896],
                [70242.9842867857,67942.60121,65860.86558,70061.39488,74826.04525,70147.31733,65831.15235,65910.38006,66419.59541,67775.1192,69393.20665,69282.12085,69214.92587,66438.52523,65245.49273,67342.30778,69758.04686,64193.36334,56860.67724,61449.66698,66188.60981,61420.66052,56730.40107,58108.71347,58980.39383,59816.62795,60360.73833,60990.48018,61028.23468,56784.52722,53762.1637,55048.24943,57954.02529,60849.6066,65116.91718,61260.61131,58110.30308,59467.56475,61148.71738,60538.47127,59685.78253,60653.38886,61408.26487,60515.47176,59387.42374,56969.83057,54741.79486,54764.04579,55318.74822,55707.85066,56075.67052,53812.54387,52412.83161,52537.7437,52689.17394,53039.6796,53410.33615,52829.40768,51064.81798,50586.93753,49583.63516,48697.92788,47897.328,48136.62219,48303.85661,48793.80071,49272.36053,49827.19641,50459.85869,48041.4101,45795.41982,46095.90356,46376.7519,47135.71957,48405.06962,49253.24089,50602.60519,50527.36797,49905.5758684793],
                [61954.6828503836,64167.20893,67505.0501,69908.84267,74208.45153,72292.44493,71033.89848,68255.17879,66196.64351,64773.14692,64234.95827,64460.875,65298.63804,67132.15359,69984.1164,63010.92927,56684.30497,59428.81486,63633.11708,63564.18803,63268.57583,59970.36471,56761.46501,60369.93863,63638.68755,62965.66138,61971.59275,62059.34052,61914.59799,59831.75505,56108.10597,57528.13113,59172.25825,59381.59389,59897.20827,60824.13582,61702.86751,63945.6825,66221.99784,62207.09026,56910.39737,57751.9102,59690.20031,59001.97613,58220.73236,58722.9553,59191.49546,56709.3161,54257.99872,54129.73538,54230.95196,53870.46435,53635.23575,52965.23998,52351.1211,51364.40385,51527.81475,51198.90092,50716.03034,50830.71607,50484.49161,50590.23717,50482.77915,48441.44361,46354.78164,44315.7674,43783.66347,45876.19262,47584.08035,47272.84368,47323.01677,46462.14062,46254.6497,47770.78997,48570.87418,48427.41622,48527.80776,48862.36398,49231.8324355901],
                [62190.9161143549,63251.50842,64075.51198,67690.58033,71958.45633,70896.2253,69474.97658,67206.00919,65155.45835,67558.85495,70525.58598,69929.91123,68070.39869,63454.89243,59634.20098,63175.04582,67270.86932,67585.73229,67129.7372,63557.84335,58784.28157,61702.87895,63592.36075,63050.39191,61791.1543,62413.43642,61814.303,62467.21059,62892.95183,62296.02215,61717.21886,61148.14712,61167.91559,62201.99433,63242.19078,63129.44863,63101.28538,64224.20874,65127.44123,62645.35383,60427.43231,59644.20742,57360.52129,58415.99695,59230.20819,59153.39574,59312.42512,58454.02929,55540.15375,53930.26552,52703.13559,53786.45602,56156.73992,56193.53868,55488.21704,54795.042,53946.39527,51399.59072,48377.28516,49461.47107,50442.17841,47893.10931,45303.5945,46038.11494,47405.2072,47060.04,45370.04795,43581.81337,47336.94632,44505.07775,45756.02605,46875.72112,51460.49783,48697.63139,46043.02346,47206.25931,48417.27681,47091.26167,46396.4843221926],
                [67418.5544456236,67866.08571,66877.86851,66350.05197,66929.00455,67648.88567,68781.87806,67272.21883,65055.0375,68635.67214,71762.45405,68729.44722,65401.98474,66185.90064,61975.46437,63775.31586,63033.35857,63828.65461,64340.50193,61856.14107,59379.22354,60608.05066,61829.62255,63426.89372,66814.51858,66128.74633,64328.9185,59736.50273,57662.46537,58095.73616,58340.22697,59004.36041,60889.52094,61297.08401,62207.64607,59538.47057,59296.10195,59402.02133,61146.81806,59957.82865,58229.10896,59883.63338,61505.05037,60760.52511,59864.61235,56816.87201,55672.62251,55875.72525,56214.95745,55844.49951,55234.17129,56525.16088,56886.09667,56534.97467,56196.83952,54527.04786,52802.33772,52213.5517,51273.00119,51422.0638,49996.71328,49250.44495,46862.3001,47166.96324,47603.43678,46517.26104,45524.99315,46101.5028,46698.023,48833.01236,50587.14813,52340.09461,54462.01022,50276.06196,44931.79836,45435.43312,46162.57314,47294.54892,48423.9032308474],
                [69020.744749481,65828.0533,66135.13456,67544.49031,70844.97105,71135.06938,71473.62236,67959.59236,66032.64182,68366.38403,71387.41202,65007.17499,59046.80214,58440.10568,59014.31187,61550.34858,63114.09179,62250.59815,60414.16225,62986.57203,64055.21972,62990.20763,60756.61063,62494.96298,64265.22434,65321.1692,66469.56692,61202.45684,55749.20505,58542.61639,61001.18456,59906.86379,58831.48567,61624.42367,64384.70554,62274.31883,60301.25104,61098.41236,61984.62617,59074.05359,56346.79707,56810.79039,57715.22248,59405.11064,61270.26304,56592.2439,51803.94969,56148.36855,60263.41353,56021.92156,51602.98727,49936.92613,48343.97038,51105.63578,55570.54812,55810.14173,55468.04165,50441.77142,46110.77286,46985.26887,48236.53194,47847.64445,47446.14727,47563.65157,47589.9468,47729.26547,46800.61225,48233.42324,49484.39845,48437.5105,47304.4253,53817.88676,57770.16702,53830.45382,47272.93568,47658.99017,47956.88067,48000.72308,48041.1379506448],
                [67609.344407237,68715.5972,69760.21739,70955.5007,72060.17585,69982.584,68207.76632,68500.01383,69817.95765,70459.79441,72493.38625,67811.11572,63638.6978,62054.71792,59984.90646,62845.77166,65728.73667,63669.62566,61400.15393,61861.1886,62663.69683,61973.45751,62215.19739,65595.30294,69533.29014,67531.62357,65381.92713,58051.04497,50876.53277,55588.31003,60413.62003,59205.03759,58483.65203,59324.79517,60147.60651,58806.29545,57173.80351,58123.23726,59836.41408,59892.70964,60046.77873,60699.66966,61445.94938,60660.55791,59759.7831,53733.5303,47792.51528,53745.78158,57828.89228,55507.22293,50883.25467,52230.27197,51173.947,57161.24181,61463.26648,58554.80844,58696.91067,57957.43286,57183.02404,54394.71147,51657.01091,50935.47147,49903.37242,49019.06156,49794.20589,50888.71925,52204.3231,49864.40163,48157.66974,47082.76432,44145.28759,51324.5677,54389.84526,50858.26327,47258.82516,48420.31013,49602.88112,47754.78556,47039.6966268275],
                [69339.048575007,71133.6415,73142.01235,72756.36302,72051.72572,70789.72367,69839.38943,70516.39451,72578.03058,70591.5462,67913.74114,64639.9501,60597.88299,61632.73961,60894.00182,62290.47144,63502.70755,63750.184,64225.45386,64124.93399,63977.20658,64928.24206,65845.48175,67777.54881,66975.26088,62299.86942,59566.07021,51316.63659,45481.62094,52967.40412,59875.8279,59754.214,60139.80721,60609.66679,60202.9459,57737.90165,55103.37023,57510.5349,60743.98194,59872.59384,59111.99784,59023.85248,58971.35446,60187.85307,61598.33755,55622.3688,51844.90893,53118.40796,54892.3283,55055.51872,55131.62723,52823.32872,51007.8315,56738.3363,62312.4001,61739.06162,61116.09219,57615.96957,55241.39315,53757.30776,54501.32669,52149.82704,52850.3497,52628.09982,52574.92622,50268.60996,48170.6027,49359.87552,50888.91593,48977.04822,47119.19709,49002.62587,50895.82824,49736.99673,49302.00119,48418.72083,47570.71669,47406.02015,46834.816609015],
                [73251.045379647,73179.33962,72201.61134,76408.79983,78819.0565,75847.8404,69465.07273,74735.70578,80346.33939,73149.98051,65896.21215,66370.34259,66576.60487,64174.83956,61167.03642,60583.16087,60918.40493,63021.67172,66009.2385,64753.92074,63782.64412,64637.18735,65204.85041,66200.59712,65909.71813,66640.8873,66585.17588,52604.09097,38283.09329,47041.03483,57283.19849,57983.62391,58653.5433,58413.02181,58198.93774,56950.73988,55640.36838,57186.24805,58860.66958,58316.72876,57101.90502,55239.73904,54750.68066,57520.3283,60650.8713,57949.55619,55582.45914,55840.27693,56387.78083,56049.04494,55478.30375,56450.84932,56809.66915,56905.18334,55649.74113,56511.03161,57265.20688,56336.5747,55429.89681,53902.0711,52719.95475,57485.79089,62234.57898,60741.88112,59207.23208,58651.23857,56568.73934,55803.39682,55065.94567,54004.92508,53026.94046,51601.56073,51308.7022,51589.83609,52703.54597,53194.42003,52506.94465,48108.55373,43701.212284737],
                [70090.2575612541,72746.55097,75278.77464,72283.4881,70241.87987,71826.13125,73769.61861,72831.87627,72634.99429,69206.36166,66980.1816,67277.41962,66483.6828,63529.01328,60940.8419,58299.89482,55836.87922,61263.94473,66818.31979,66119.24445,64944.24557,64582.7409,63848.1389,56959.00777,49644.89771,54639.73058,60860.47003,49450.90686,38049.67504,42964.53065,47823.30751,51451.67783,55870.19472,55522.82702,55097.63472,56097.84329,57335.77071,57833.21878,57850.06721,56093.10209,54318.52944,56697.07638,57104.92584,56673.44924,56904.2837,57138.23144,57372.66818,57715.80732,57085.01365,54814.35612,51028.83109,52615.76538,55459.84415,56126.5912,54295.12937,53099.10148,53590.38009,54478.1407,55243.14414,55251.17618,55381.78312,53280.2413,50958.88368,50543.13368,51582.03207,51587.66469,53852.21726,56625.31167,56042.69953,54464.26732,54836.81518,56001.9958,57526.70637,56499.18928,55402.64012,54337.49483,53408.66151,55324.60284,55354.3717139063],
                [70115.2592936938,72543.0599,75318.25626,72641.24028,70670.15907,71952.1189,73506.51683,74575.94131,75205.19897,68532.83792,63595.12569,61992.05596,60855.229,62400.48975,66676.65869,66806.25464,67479.49799,68638.64048,70871.4374,71133.34016,71489.51565,69895.46268,68026.01718,60102.75383,53816.65929,57278.73227,57274.26131,53304.37946,46559.95977,49651.29447,52346.35174,54442.71373,54761.65544,57744.7023,57259.4113,56513.86999,54479.96868,54525.05761,55025.56406,55434.92255,55550.8456,54984.87335,54541.76274,55749.15189,57009.93944,59029.01359,58319.70148,57836.86724,56881.11423,55473.03428,53825.56229,55717.12472,58045.7099,57428.86168,56856.04742,56194.05677,55711.87854,54866.8431,53725.8324,54689.10637,53864.74859,51056.34897,49870.00972,52181.45253,53990.16432,52892.50769,52158.17533,52450.27236,52052.55978,55125.72525,57698.45605,59054.97282,60236.30359,58794.89973,57658.6056,56894.02665,56557.01637,57361.89705,57210.2429437151],
                [72202.3329206532,73168.86713,74273.36927,73702.26773,72910.38446,72965.44864,75238.86253,76235.94434,74650.99778,69625.13839,64301.04923,67316.18376,70413.92533,68911.35054,67192.08353,66486.49493,65828.85462,67397.12201,69029.56343,68907.11955,68631.46013,65377.23071,62254.24152,59452.36589,55734.12471,55147.18925,54433.40654,54105.82053,53743.1415,54873.43356,56771.29064,55941.07858,55187.70485,54902.82624,54616.65284,51249.357,47883.19315,49961.76883,52031.09665,52727.55932,56732.23514,56281.80751,53345.37355,54145.3143,54575.0603,54350.78546,53896.41034,55118.16799,56083.37669,54260.03718,52621.78535,55349.09158,58310.36308,57533.60327,56395.32066,53443.48576,51875.7564,51002.4157,50208.36277,50145.97695,50296.7471,50107.04124,49847.54837,51968.44363,54073.69549,53213.19341,51465.32539,51354.56785,51590.66362,53705.2072,55978.24952,55520.55525,55872.94855,55212.08199,54866.38568,55988.44376,56724.90613,56367.76931,56145.3826245257],
                [73755.320231058,73720.58694,74209.51753,73734.67401,73601.90257,72971.00556,72618.5038,71255.48147,69750.7752,67162.46294,63829.14997,64628.0278,65700.68303,68377.54412,70563.58859,71679.52068,72496.53179,70595.99648,68600.78253,67690.32493,67223.01391,57608.71243,49837.18697,47682.13301,46686.10657,47269.1053,48864.64281,51162.51822,53490.53488,56140.20313,58839.03651,57904.62999,56708.44368,52164.5551,47814.5131,48653.52359,49697.25629,50563.47249,50870.21503,53904.85338,56448.16302,54429.63672,53514.4035,51859.99157,50184.07519,51839.0909,54256.45202,54985.29989,54457.96616,53606.69781,53174.09846,54509.4135,55615.81855,54875.44471,55428.91656,55596.13776,54645.27338,54646.75366,53337.61198,55607.19406,57840.18403,55701.50898,53597.31583,53927.50455,52235.90766,50589.63518,49165.36696,48718.90178,49052.95034,51174.84837,53841.6679,52836.07842,53334.15333,51768.72752,50435.0454,52355.90163,54410.71451,54449.50467,55437.2962205236],
                [70056.5296404329,70456.78926,71674.88081,70114.28132,70020.06784,70282.93065,71765.69307,68560.14035,64831.77733,65334.4012,66861.3708,70867.38458,73822.30019,73978.14124,73386.29338,72235.13481,69235.92867,68966.81612,68285.15682,66563.9079,65064.53779,57381.70683,49369.2638,47658.47282,45137.17169,47925.85064,47219.88671,52745.16041,57694.12512,56426.00826,55224.02087,56088.34474,58155.98692,53683.7149,54816.96423,51602.15279,52975.15639,48538.40473,45267.74371,48662.05222,52180.88634,51433.08553,50712.53461,50191.34766,49679.09533,50737.023,51477.26849,53225.00751,54947.7652,52385.44814,49765.40466,51394.33436,52368.6934,52037.27463,52013.17638,49797.82432,47806.78686,49617.35456,51502.49465,50021.60977,48772.16274,51351.51966,54227.98198,54133.28464,54410.56451,53491.1282,52004.74637,51353.93777,51266.69558,51630.3963,52329.81583,51188.71158,49969.49765,53742.02464,56844.99421,54702.14633,52061.25527,53452.07996,55389.8657947633],
                [71273.0557784282,72405.57733,73417.9445,75208.95715,77063.93306,73527.68523,70595.99286,68322.23443,66000.83625,66747.3952,67523.20676,72059.25775,76552.36304,75873.32724,76209.1822,75652.10417,73889.41592,71547.48498,68302.0774,65024.74327,62658.57137,56218.00918,53868.16114,55519.35154,57111.56509,53156.91966,49223.54367,55277.32073,61323.39913,61911.55006,61294.87421,64105.09507,66656.7949,62530.06726,58174.95918,58629.4745,59008.18112,54957.11244,51245.82474,53808.05198,54504.20252,55199.5626,56049.57158,56891.67649,56542.96058,54571.59192,52800.40543,52634.34923,52631.709,50671.16339,48917.50532,50087.19289,51112.50257,52598.09283,53951.57141,50462.10356,47809.17026,47255.59876,46910.82117,47765.18041,48660.07326,49685.88055,50650.85582,50733.97167,50882.26168,52009.32071,53168.24212,56128.86192,58647.96618,58435.56494,58068.28998,55192.80476,52847.27217,54054.82612,54921.32122,55433.18285,55503.06376,52927.68488,50829.3871552372],
                [71746.7302887381,75252.14476,77694.31323,78396.41769,77755.10591,74219.96775,70000.63286,69810.68716,69133.89052,71859.8695,74508.47917,77408.84037,79959.96243,77605.54123,75276.83979,72688.89103,69953.28204,68045.35748,66187.82023,67548.00018,67978.64587,68734.47749,68228.23407,66460.29218,63860.83622,61488.75728,61367.40659,60105.76143,58510.43445,64325.97416,70250.70397,66948.49481,61999.12834,62582.40043,63133.45825,64009.48985,64898.39403,63819.37154,62067.9831,61515.3882,59631.73997,59432.00567,60508.3427,58752.2079,57109.05496,57167.72712,57444.67378,57060.44104,56593.89222,53979.1418,51856.30575,51382.51079,51659.67036,54149.29527,53703.48894,51465.59598,48765.31896,50495.17259,49662.26099,48948.38859,48196.06143,47730.09518,47258.72822,47592.05208,47710.27574,47206.05077,46850.53646,49398.02663,51044.93068,53212.25501,53483.27247,51675.27222,50347.49074,48911.98244,47896.64496,50437.39006,53236.58901,53687.43761,54627.2979753554],
                [70891.1775065767,74268.4983,77709.39129,78551.69552,78105.12957,73114.20147,67689.1901,68718.12363,70562.07658,71991.13543,72745.14015,74819.34979,77482.63119,74422.0161,72943.7957,69182.18623,66640.46674,67063.98974,67619.95053,69106.74256,70427.20189,68407.62073,66042.45128,64678.87691,66565.91501,68533.89857,66490.55972,57277.48111,49268.03766,58737.20746,66892.76001,66404.79895,64685.51732,67103.17058,68797.26148,65436.74941,63421.56393,66800.94011,68589.68155,67058.13471,65942.81964,66006.57708,66136.42024,64410.57963,62699.0985,61229.53524,61340.59991,59980.81901,58674.49159,57654.25548,56669.79315,57991.04544,59488.0975,55100.29708,50693.15502,48777.05473,47141.46236,48523.22142,49992.11693,49690.07783,49226.59869,50252.62641,50771.02428,50574.37837,50565.40812,48905.49946,47527.79504,50016.17614,52526.86216,52373.8969,52306.89921,49117.27484,45455.8042,48919.63444,52253.7254,50114.74476,47918.06651,49548.46313,51748.0278784972],
                [72223.2721481197,73584.85862,74960.10589,76435.13746,76998.83453,74305.457,71296.70391,70662.76519,70549.02572,73251.52989,76008.362,79322.78594,82497.42513,76554.21717,69536.78478,69999.6288,70415.96951,72775.56456,74865.38587,73564.90683,71367.26982,72145.56793,72540.69967,72298.17706,73437.57408,73617.81462,73548.7769,64215.87097,54696.90858,59370.59089,66253.98314,66730.46977,67068.43783,67820.05052,68610.81695,63869.60076,59474.32807,60691.5576,61421.81485,62239.40987,64622.18606,66378.6042,69383.41529,66147.81197,63775.62293,64448.82564,64889.58198,65275.40004,65613.18416,62610.42548,60352.93102,59834.25324,60444.00591,58052.98838,56162.26499,53720.84333,51167.79931,52439.54636,53693.37871,53010.51849,52369.53957,51530.52659,50670.8084,51522.26839,52641.73018,51358.39337,49571.49761,50063.69532,50637.88021,51491.93053,52369.32486,49734.95799,47237.11948,48743.1263,51003.27709,51189.99545,51993.96964,50304.6191,48977.079727147],
                [71985.5530761057,76843.38824,81296.92432,76770.54836,72606.47908,72112.18021,72904.68607,72495.6007,72827.49527,76552.41768,80102.19991,77270.47602,75013.56132,73673.05571,72124.04191,71285.12261,70633.16241,72283.91992,74852.85968,76017.78909,76930.85314,74857.25494,72797.94314,77453.17056,82084.75515,76661.75347,73684.82837,70853.02667,67902.51749,69976.57457,72088.04827,72574.48126,72483.91433,68568.79255,64606.10451,65706.53784,66771.06649,64563.32237,61774.21473,65750.73098,69083.68149,68431.2847,70170.20733,66698.81294,63313.55216,64210.9192,65245.34166,65243.04038,65715.48678,65055.30899,65235.69297,66606.865,70044.08,68860.4447,66143.12341,64754.86291,61675.45826,63129.63037,63755.40929,61146.50997,58613.34733,60676.04203,62647.44056,61117.70216,58407.79278,56313.76896,53834.11613,52561.11812,52947.40195,54952.08731,56813.38391,53768.18454,52125.97206,53547.44361,55458.9117,53269.45702,51310.52038,52211.76899,53438.1221392608],
                [75537.7652766371,74886.16638,74809.92808,75402.29634,76785.84326,76168.77859,75664.58919,75510.8222,78051.03681,78004.02135,75425.33541,74883.28048,74219.77866,71621.09233,72203.86799,72466.15294,72761.35833,73824.54296,75679.41669,76198.24734,76823.27827,72320.5683,67646.32279,70042.72141,73020.67649,73017.36274,70232.56388,70038.20456,69737.51113,69892.42986,70084.48804,71060.92759,73498.44008,71387.06703,70074.01414,70232.59706,71369.33595,68862.52839,67138.94785,67750.56355,68643.79375,69579.63153,70673.0879,69957.17635,69100.31316,68748.01889,66575.85512,64733.1013,62916.12177,63323.04556,63705.05422,63020.20632,63172.40596,61328.0473,58865.47401,60691.19324,62361.3884,62067.10733,61425.16462,63423.15226,64217.89583,63678.90654,63315.68384,61522.39145,60280.98024,61177.09172,63247.00265,63355.93941,62649.73747,61513.98088,60063.7485,59825.44032,58899.80498,56070.83639,55097.11613,55914.12122,58594.41768,57322.63088,56893.1941304652],
                [73798.506159232,73988.08736,75160.38801,75111.74787,73810.41993,73614.12107,73413.27384,73980.76336,76101.55929,74807.95051,73666.73356,73464.03666,73376.37928,73561.75955,73227.67622,76733.36286,79927.86076,77403.60435,74258.67315,73189.69297,72229.30939,70834.48553,70479.74614,72640.8582,74891.65937,71299.45323,67691.91615,67222.84841,66851.3241,69343.2458,70048.88867,68927.21056,68013.05455,70937.06368,74357.9475,75762.45157,76585.13003,74368.57567,71756.91,71024.09924,71762.73255,73707.43308,72406.68058,74305.81946,74455.0647,72685.13937,71157.83502,69754.68238,67603.52389,67346.48063,66366.97011,65119.46352,64341.86267,62089.96183,60460.66732,61823.85785,63944.03872,63376.777,62791.79946,62237.0013,61677.40478,61675.29014,61679.32296,61206.9872,61230.36519,62806.51631,62998.7866,63728.54741,64466.67008,64289.9155,64126.96238,67607.79928,70623.83326,65166.58438,58841.22439,55276.10414,53614.7823,57933.97374,63340.6451010871],
                [73828.7862570721,77608.74072,79804.09041,79215.69726,76698.37771,78720.3049,79791.18976,79803.06214,79475.39383,79014.44841,78316.56555,75401.5686,72561.11761,76292.19031,79936.6821,75968.34488,71911.4796,74281.62716,76015.7659,74209.49188,72090.05628,71724.58845,71437.3329,72262.78315,72830.42579,70869.85936,69724.56887,72825.5658,75873.71206,73399.57631,70927.78032,70096.6497,70347.31819,70227.59287,70164.29641,70865.57362,71463.62144,69312.81274,67498.94306,68230.47342,69753.05784,70557.97445,71548.66106,71583.9319,71599.01184,71682.4571,71848.41103,71231.2915,69429.13167,72580.54591,73265.07037,68065.07467,61704.42271,63339.83019,65679.26536,65050.2495,66152.17594,64638.87954,65679.017,64358.18791,63195.2632,63992.17284,64964.54975,64919.07428,64813.96997,62002.53513,62560.2564,66428.11301,68156.34516,66060.8695,62631.70665,64262.97788,63476.19779,64711.9007,65239.02516,65166.8114,63403.34977,64662.82278,67212.6713134185],
                [71913.9893122127,72345.02415,72856.83246,73999.58626,75996.58723,77412.40429,79285.36823,79882.50721,80847.96041,76729.7002,71652.01152,72772.67726,76142.88772,77714.09753,76699.70143,76320.56093,75233.88211,73464.66413,73418.82157,71395.91878,69863.09201,69826.7279,69510.31158,71045.04933,69962.46176,70774.85635,71966.81725,71795.22795,71460.53431,72056.56164,72082.7327,70824.20799,69846.38227,68937.39599,68876.94012,70207.67219,69939.88363,71490.93333,72267.01046,69269.85366,66357.39115,66818.09512,67332.40282,68831.55431,70089.81775,72035.65929,71129.85415,68612.23777,66182.14492,65433.55384,64609.20187,64998.22638,64726.59834,71213.63418,77075.41196,74790.19974,72310.08773,70911.93,69817.25289,70637.60041,71359.26988,72093.7952,73450.33663,72424.8292,71020.94472,69369.37426,67205.9919,67494.51998,68985.09016,67887.73851,66895.8067,64351.81024,61243.1024,61378.05497,62099.82306,65185.78023,66973.75709,65455.0952,64603.1043997744],
                [75064.7210331781,69099.58685,65930.13333,71584.85688,75151.98482,75812.78383,77195.09197,75749.11009,75155.12409,74362.07053,73582.1937,72894.21548,72222.03974,76789.36704,82399.54396,79694.9847,76738.94235,73812.86276,70669.57908,64158.00279,59503.01617,63098.1514,68071.92046,66415.93596,65623.81394,65945.01715,65913.79394,66492.45418,67010.14461,68566.17016,67899.33723,67179.52284,66531.72661,67414.11778,68168.29735,72088.5085,75342.72312,74128.9994,71450.69952,69437.63677,70018.42163,66468.59909,64447.68533,66787.96339,70551.98399,67151.04076,64928.83935,65547.76573,67308.72769,66827.10979,67025.45327,67316.45425,67796.00452,71271.82936,74749.90809,73633.70678,70918.58362,69874.97478,68970.01388,72803.24668,76776.46595,76992.47598,77572.69396,75027.59714,72698.17309,71043.40982,69744.14166,69286.93024,69030.41838,70023.04233,71106.71812,69020.07037,67046.78451,68455.37173,70139.57773,70656.84734,70771.31614,69559.63997,67437.2476844993],
                [75311.840534847,61694.55783,47795.16078,62296.41715,77070.47933,77800.09499,78316.57362,77204.92525,76201.78234,79502.43367,82375.50824,78298.59572,73607.35132,77518.03646,81428.41403,78266.23394,75089.71549,74314.60868,73634.82992,68298.99608,61807.42638,66461.81564,70625.47761,67353.28973,63742.78654,61184.47798,59102.13889,58490.57938,57509.53517,59253.35945,60993.33641,63614.85597,65537.59691,66535.23623,67379.0729,67935.22764,68470.02362,72188.09796,75382.44139,75004.81164,72617.226,67410.95883,67356.60975,68601.20396,69627.71688,71803.65507,74039.48662,71823.6284,68134.03494,69666.95639,70365.81217,69796.70949,68871.32842,69885.32553,72533.02145,72559.95551,71542.1852,68247.43144,66082.09758,66263.47777,67135.941,69573.2168,72703.69713,71955.0284,72552.39787,72621.58641,74869.76007,74944.71072,75229.88847,72440.09066,75094.86649,71623.57949,73741.87391,76164.45874,78377.41393,75227.53454,69970.6533,70791.72131,72698.05512345],
                [68313.5151554066,61110.93926,53837.16638,67631.33197,81045.53168,78415.24298,76340.20594,78749.58972,81662.71049,82750.97093,82232.92734,81131.52699,79111.68493,79871.40311,80964.68927,75400.37728,69976.52086,67805.90557,65610.24781,61547.59124,57475.68604,62262.40876,65313.63389,66217.15892,62740.95527,62522.02671,62863.09284,58018.92297,53970.20687,56072.00374,58180.20775,58532.20026,58996.11421,57692.6415,58541.43625,59711.69537,61904.4974,63273.40126,65055.1837,65248.94566,65442.95388,64419.43592,63396.24411,65301.97129,66631.81516,70683.12969,71321.76004,69749.64982,68380.24453,69069.42334,69630.55883,72548.72274,73592.81828,71824.24086,70590.69605,69654.39317,68686.38809,69901.54226,71256.78975,70141.17564,70750.33085,70422.09608,70899.51532,73043.38004,74026.10848,71141.76412,66369.25532,66570.50501,67978.19121,69917.74244,72213.47597,72165.57021,73661.18685,72543.87286,70686.0462,73485.10713,77110.03229,78089.27877,78888.2003123871],
                [67119.2194672088,63778.6166,55698.46972,66931.0449,79567.91379,80244.78158,80048.16095,81399.98282,82722.15869,79971.23455,77385.81976,80073.85163,82817.95335,78642.17262,74630.01942,66719.72631,58983.02455,59576.80277,60430.19823,58109.25989,55792.84617,59641.18028,62261.11645,62133.83985,62648.7933,66813.78522,70752.40688,61435.27198,51886.38745,53443.8696,56158.4925,54068.37829,52418.1839,54286.41253,55958.09069,53757.37389,51683.29667,52224.75502,53457.56209,56112.39603,58767.92688,57543.21363,56070.75719,57083.99118,58239.45176,58748.8615,59646.26577,61300.80932,63543.05128,62760.78707,62904.22174,66021.42242,69241.16348,69641.52214,70120.86666,68635.43825,67826.04606,69830.56055,71608.8875,71102.25668,70877.40566,72944.90609,75760.8132,73526.98742,70929.22818,70362.25983,70215.31064,70651.20327,71076.13428,72239.96261,73354.49631,73285.06902,72870.05012,72461.30922,71708.79984,75072.27944,78385.42443,77052.88898,75219.6682461824],
                [65639.5405576345,72869.3803,78950.54809,82491.32825,81852.2643,82573.33522,82419.81879,79311.36525,76088.10807,76686.91381,77232.11996,77822.72641,78587.49094,72985.77469,67295.56495,63601.15916,59700.48446,60386.31154,61305.4305,55586.19299,49537.25406,51259.00093,53038.63946,52259.65794,51357.40317,56293.33596,62185.54357,53019.63145,43982.72605,47172.04293,50190.74946,49227.53423,49065.39921,48067.8308,47093.57369,47273.05002,47697.07858,47105.783,46990.18987,48485.0653,51107.29967,51649.65352,50768.32447,53387.59613,55997.37154,55510.82449,55012.12443,55734.39965,56706.35753,56708.22564,57385.00626,59220.1264,61151.37527,60782.17755,63973.3848,68089.08326,68489.42255,68286.43749,66609.30582,66310.55405,66492.99675,68728.393,71421.24194,72023.01014,73134.03567,73859.45932,73856.62389,73005.04063,71607.16138,71209.22633,71332.34574,70867.47894,70977.4351,71266.72931,72100.71143,74093.05168,75588.3679,72072.90974,70878.3947247846],
                [78152.9977440262,72504.18672,67645.71355,72006.86104,77217.90318,72568.09245,70664.3519,73638.86418,78930.34571,83714.30119,85127.0881,79628.21604,72909.13953,68206.21081,62510.42578,60305.7139,56041.61962,53302.32423,51295.89022,48517.68783,46404.77339,48205.57795,50610.37479,51523.58093,53519.07812,58665.8127,62445.12588,54709.35554,44877.06751,46501.86122,48380.44203,49936.72844,51904.16979,48935.49812,46822.45137,48230.90828,47453.75584,47307.99246,46203.46409,45488.35215,44779.95939,46175.90684,47649.02604,47090.95523,46648.68593,47459.31696,47884.52354,49615.84043,51460.37851,49910.35533,48661.12881,50446.13319,53420.39935,53306.85008,53329.76962,54545.54014,55814.51227,57748.85192,59765.57692,61475.37316,64093.38438,64877.63546,66534.9413,67945.04507,68270.56746,71031.35954,74176.89721,71557.81595,69079.011,71748.72286,76024.41199,71333.99374,65771.64397,72172.4909,78420.81662,75155.78182,73013.94884,73360.55229,76611.2098620417],
                [80266.3951908114,76901.42478,74590.68251,75124.08705,77201.41075,73545.24151,71079.47017,76888.46891,81639.634,75732.26425,69893.86401,69331.28071,68922.86339,63180.23516,55921.33492,52755.70278,49633.627,48092.81818,46609.30879,44319.21872,42878.0381,46949.63422,51396.70558,52970.29765,54164.1573,52359.30957,50824.83579,50105.60538,49196.63495,48765.53045,49587.68603,52548.24031,55097.62409,52069.59035,48543.37402,48087.22974,47308.18388,47274.54659,46590.22364,44512.42613,44708.43843,45297.47619,45152.09072,43223.66391,41961.67743,44180.17141,45833.44991,46061.55512,46613.8271,46864.39766,46751.20858,49157.05859,51307.88233,48394.68919,45134.41147,48311.23737,51935.71361,59324.05325,65892.51761,62106.21614,57827.93999,58207.55842,59319.28754,61123.81009,62460.28139,60842.34039,60200.64221,60657.9898,61193.10297,63408.70022,65811.76605,64246.78036,62411.08166,66177.12726,69972.13037,71735.6494,73719.34911,72690.95094,72445.0739888431],
                [79909.538644252,75835.66791,71884.7548,74071.35747,75883.81526,76387.70936,77752.46616,79128.73548,80637.31208,74017.44204,67079.1631,61928.70317,57167.79942,56075.0976,55051.2031,49738.14718,44382.38017,44767.31238,45016.15309,45634.60261,46570.98519,48005.42185,49463.88944,49268.44554,49056.28068,50837.92504,53244.92498,51799.8266,50077.31829,48479.14158,46755.03902,49702.13978,52573.6991,51572.60226,50418.52338,48069.47157,45689.48326,45708.7621,46495.63936,46226.79859,46740.46898,48333.18643,51106.52945,50639.45632,50204.01089,45980.74986,41789.54675,43724.54521,46373.82324,46277.33812,45783.03932,45882.4971,45012.7366,44278.14502,44808.37025,47225.92968,48676.2825,47665.26736,46261.22933,48171.34461,49951.28442,55542.56082,60380.90494,59115.60261,54263.04119,55693.24893,56150.02554,56947.21033,55505.00158,55826.01425,56100.66605,56553.36805,59051.1738,62215.97372,64737.49808,66367.18747,66672.30536,66004.74411,66649.4912160204],
                [70240.6138323352,71860.3955,72827.50625,77005.68749,80142.82257,81440.29605,81624.98666,77619.43006,73054.89332,72154.40225,67820.89241,67072.55993,62897.51543,56309.19137,48789.09637,47566.32042,46841.17716,47525.87365,49152.09896,50971.8867,52898.66962,51799.38161,50970.21403,49951.47062,49685.08614,50715.27374,51870.76231,49821.79119,48161.20315,48318.3571,48373.39859,51655.55857,54577.17457,52869.49769,48973.22677,49055.18103,49247.39083,48459.7562,47846.40805,49582.93446,51203.11721,50957.01921,50598.05726,49525.97235,48422.11555,48222.76913,48701.40454,49905.94437,50907.69133,48251.43592,45788.88503,47408.37213,49536.50356,47487.63903,46525.65044,46174.24216,45838.70902,47031.11729,48231.62282,47518.76173,47352.5657,55330.69443,62200.43858,54208.41217,47432.70304,47489.69696,48162.27864,47339.45674,45649.30343,48984.46555,50824.57339,51127.31634,52948.71159,55602.09556,56357.02318,57519.23137,58956.47167,57581.493,57792.689739379],
                [67785.863227299,67331.87312,65999.74106,65444.21232,65973.7336,71817.95524,77665.09469,73212.63126,67927.37905,63578.08509,59550.19678,59433.57189,59455.04533,54776.66059,47683.95752,47510.45037,47347.80404,47985.0418,48608.57919,47658.55927,48479.8622,49564.79617,51212.32764,47919.10235,45255.20637,47301.8115,49647.10795,50892.02622,52346.18684,52917.18872,52972.63515,53782.51224,54220.93692,51215.08245,47925.24285,48133.73135,48114.19563,47005.41903,45761.20194,45490.80619,45995.71203,46938.06511,48086.24437,48047.39718,47349.45425,48202.37639,49257.47746,48601.01915,47713.94412,48064.25719,48240.55201,46672.90479,45097.53608,46913.81281,48755.02,47817.3458,47942.62964,48685.00928,49085.90365,49439.68059,50354.96258,53647.78892,57886.54748,54547.1053,50737.32671,48381.2224,46369.66251,44613.69484,43008.56179,43830.39469,44931.73506,45832.27347,46534.64084,48761.22469,50917.64857,48535.0563,47298.57902,50267.61923,53828.017608817],
                [68867.0030991446,66071.06549,63304.86942,69612.54288,75473.37581,77463.15609,77002.91713,69503.73602,61566.53203,57757.30068,53747.91364,52274.89515,50906.83149,50661.64641,50443.40631,51317.80738,51927.22073,49930.19285,48300.0633,49906.7368,51687.75848,49516.13455,47362.63025,48681.10725,49973.38507,52564.9439,54918.69151,53733.71947,52247.61267,54194.79557,56043.11108,54470.25203,53281.21411,51723.83794,50395.29456,50753.00445,51007.2988,50189.30922,49149.80477,48509.63984,48755.67708,50905.53584,49428.24912,47892.35141,46180.10889,46745.54406,47311.97501,48421.85697,49183.31628,47542.19198,45713.79327,46743.95483,47444.07558,48880.74603,50708.75621,53257.44753,54978.87947,52314.4208,48639.11911,50298.57371,51877.67911,52977.12482,54357.63265,50455.70253,47281.18148,49497.02212,49540.91664,48321.40032,47568.15911,48440.44694,49461.44729,47331.51452,45411.32068,44882.01534,44732.44529,46846.87568,49617.24729,48953.90249,48581.6382156031],
                [68261.7507851033,69050.23889,69618.10821,74482.2034,79092.33815,75869.98776,72731.08951,63996.60964,55362.91755,57269.32933,56547.84888,53597.85557,48064.55622,49334.29767,50049.25867,51662.21522,52924.72625,51294.02586,49515.86957,50875.04567,51338.15063,52240.86335,51743.64264,51204.11809,49373.90524,48424.34392,50405.64258,50619.11391,52232.05741,53564.15017,54932.60667,52124.76972,49341.73071,52819.13206,55088.47838,54791.149,53501.42511,53025.4713,52377.63975,49650.5934,46614.7617,47179.55309,47381.07365,47332.95731,47656.71868,47099.18961,46284.06454,46546.67265,47127.12699,47973.96323,48835.28681,49490.97019,50434.03206,48557.66672,46959.27774,49327.95608,51643.90508,50875.36174,50153.30804,50328.35357,50362.29216,51554.08016,52748.89762,50947.98604,48468.84108,48262.29441,47306.23054,46496.92782,46213.44657,47910.23708,50072.32654,49570.09995,48681.35423,49418.92887,50097.58521,50305.10027,50751.34033,49271.85018,48885.131721311],
                [69934.0361867115,66477.2205,63438.01619,66172.09754,69896.46218,71980.00676,75063.77606,65806.23783,55608.98965,51811.75157,48195.10967,47505.9033,46555.7464,48646.09046,51622.12047,48571.86908,45657.76035,49186.7426,52917.49576,50778.33657,48170.74337,48242.54646,48465.48856,50484.28936,52072.45556,49621.08995,47297.95368,49157.52218,50950.37403,48816.57726,48223.2195,48593.8858,50319.25412,50295.6496,50367.2705,52611.66662,53243.03179,52624.07494,53015.97145,49353.77964,43395.75724,46166.85721,49347.66948,49747.09162,48804.185,48354.52614,49744.06991,52025.75301,53556.19741,52450.91823,51413.13412,51688.67101,52029.43734,52415.56225,52829.48513,53913.86292,55176.25519,53259.43572,51198.14607,50921.73693,50591.47145,51397.24601,52310.43615,50000.71568,47629.42856,47340.95175,47262.22062,46895.64307,46851.3155,46677.85552,47065.1747,46114.17688,45205.54108,45685.32744,46466.92151,49854.52059,53625.78093,52274.92467,51112.600241836],
                [67975.5315656299,71016.12926,74076.04448,77602.93723,78017.93924,77115.55627,73088.84552,62484.04768,52024.49799,50559.84244,49250.51645,48752.81876,48361.9433,49693.53769,51068.13261,49247.48688,47868.25329,49964.51754,51821.59768,51154.42829,50270.6622,51491.89585,52834.6245,51494.85927,50181.95129,48566.49922,46998.24991,46906.08924,46743.36794,49275.19892,51278.20912,51244.00562,52393.67596,51381.14786,50626.28927,48084.48147,45977.39617,42049.36818,38559.9087,35410.01542,33031.37664,35862.23226,38855.26327,38402.48459,38149.06551,39947.09231,42104.04749,44230.51983,46515.98882,47876.93492,49091.91212,50567.39596,51883.15619,51435.51644,52623.59885,51621.14551,50372.51028,53062.36504,54085.89466,53236.21755,52167.90234,54153.37201,55995.52054,52083.22784,48002.01846,49616.72106,48292.32103,47189.31047,48889.71634,47831.56864,47576.95722,51864.7482,52496.65107,53383.42247,51544.66037,50461.47171,49370.69495,50855.07216,52206.9647342014],
                [71375.5442440014,71779.12764,72831.96031,74866.68256,76415.38469,71465.46814,66282.23158,57945.24559,50413.08771,50432.16125,52011.81238,49338.65857,47875.43001,49659.46733,51878.84748,51849.18501,52205.14646,54111.00089,53371.17122,53454.9318,51287.40608,55101.24988,57113.60121,54696.05928,50339.443,47924.14129,43847.56312,44915.5371,45314.51456,48330.52664,51350.08614,49865.72466,48383.6566,46150.09688,44988.42552,42911.28986,40954.33001,37839.34017,34551.54495,32978.21896,31630.61586,33288.25401,35057.73065,35603.22373,36165.95943,37720.00991,38631.09668,37540.84291,36866.44177,37282.90964,38160.98282,39512.08255,40214.4092,39757.84513,40118.87519,42970.01814,45656.78745,47167.73569,48536.97564,50222.19771,51880.9832,53668.38117,53784.66271,49305.14304,47716.70635,50710.599,53914.47312,51895.95564,51624.71835,48916.18765,49551.40615,49810.81616,51659.85586,50843.51157,50089.2794,50094.82024,50485.8127,51762.08742,54419.8677080786],
                [69964.0171019108,72849.18269,75546.62485,68482.29422,61864.79711,57757.53065,54367.74613,51638.94098,48179.48845,50378.08875,52310.81537,50375.63423,47897.92886,48052.21008,49319.33441,50325.85794,51258.82364,50511.54252,49609.63643,51119.09108,52335.37237,56054.85056,58557.95009,51656.20816,45598.66164,46482.99251,47701.46523,50331.51795,52847.76803,51663.80382,53488.91247,51470.05547,50321.74099,47079.38123,45068.78721,38920.97262,33937.97385,33331.92727,32160.57586,30624.90505,29937.16767,29846.82767,30105.61425,32796.07791,35721.70506,34566.21363,34911.43696,36113.91024,37815.98373,36398.82101,35235.97707,35374.67757,35494.67468,35747.5531,36009.28225,36513.54531,37131.95949,38483.13485,39665.54219,40012.26444,40375.3341,43037.45121,45003.71817,45506.70008,45584.80933,45697.96746,46225.8046,46723.86478,47414.47661,48030.77351,48665.98332,51059.94205,53360.43205,52970.03184,52564.67647,51304.10853,50172.16707,51596.5804,53391.1947794943],
                [77260.050657705,78157.65628,79152.50559,76600.64139,70392.25375,66049.3848,60899.20648,53952.32874,47173.32005,47890.64607,48602.71853,44557.05796,40700.3884,44076.78524,47705.62029,49814.87111,51766.84349,55107.82814,58372.13942,55246.47352,51987.06552,52505.25473,52710.33641,48480.34162,43982.58151,47582.33436,51429.03579,55954.11478,58702.98538,56057.17356,52076.47077,49341.86832,47082.65733,41692.61491,36246.02411,36474.66176,35709.86234,35220.98435,33793.32937,29445.7321,24678.31346,27692.13146,30468.37094,31283.01463,31875.98937,33502.67944,34993.93615,35195.42917,35462.5033,33508.22869,31881.35759,32940.22193,34648.54271,35360.87649,34681.27529,34100.72981,34748.86074,34983.3953,35434.4062,35474.84305,35697.48128,35813.65934,36260.89662,34868.81163,33916.20214,35439.46983,37415.11514,36930.08929,37469.38049,38775.58753,39725.08768,41558.79547,43418.91144,46085.06691,48494.66283,49292.06307,48964.22043,49847.47184,51413.8146391421],
                [80158.620921572,77151.3086,74229.98295,75951.87573,77563.4984,74576.26546,70900.57368,62367.89514,53638.8413,51844.21267,48288.03356,49775.01478,49819.00457,50647.09204,51425.30915,49029.24781,46569.91526,50160.08866,53884.77823,53050.98454,51221.34654,48560.9201,45456.21674,47372.47253,51850.78798,55165.4411,53865.42882,52529.06527,50787.06186,52040.91952,53231.03545,48715.21776,44244.21063,38270.33023,31097.72998,33286.08765,36146.71505,33861.983,31605.59889,27335.71052,23349.80212,26536.40616,30015.49839,29763.83765,29482.99825,32522.113,34535.27331,33578.0061,33173.91096,33122.03389,33214.71831,33927.37783,32761.19858,32808.41374,32621.69574,32996.83774,33489.61527,33846.83467,34119.99426,34913.83785,35822.39618,34062.8791,32414.69856,33724.19524,35320.88317,34786.08923,34886.74473,35058.57971,34432.1926,33472.8675,32810.08957,35098.77847,38652.30561,38794.16894,39143.96855,38201.54795,37592.66039,37827.03983,41101.168925424],
                [79558.2387954829,79733.67863,77561.61802,76705.43381,76055.22374,74985.99346,74157.22542,61154.28082,45338.84073,46095.8834,47673.15628,50541.59884,53825.78193,51968.68282,49974.16053,48613.40346,47308.17363,48189.49201,49223.17536,49525.9617,49657.69407,48770.0759,48493.17916,58393.1483,65774.22976,58929.63646,52197.78117,50665.37401,48630.14787,47564.63465,47054.11642,39728.76992,32850.89069,34765.78791,36534.81268,34773.9368,33282.02879,32099.1432,32274.83842,31698.82585,29949.23827,32335.28968,34474.16286,35000.17989,35107.73897,36513.42747,38939.6621,40319.1649,41317.49192,39737.42336,38543.12287,37071.99555,35554.39637,35651.77232,35725.43564,34189.53923,31749.44859,33324.65124,34626.9658,32882.66816,30937.95021,32603.89417,33865.26975,33707.20048,33562.25844,34192.92722,34592.77478,36199.38182,37485.26911,37078.45176,36306.49615,37733.92763,39116.79272,37906.85839,36654.2391,35978.49296,35390.89118,36445.01852,37407.9923473646],
                [76127.8721517941,79552.99597,82808.28335,79463.96237,77249.03917,74882.97135,73242.55065,50930.58265,28821.90405,40550.65238,52459.68743,59459.60117,66392.21308,59539.57742,52795.29524,49633.39413,49506.48869,45144.89487,40802.14654,43186.03499,45590.30971,47372.87031,49185.83547,51952.28086,55205.92974,51174.59297,47413.40017,46470.29672,45225.41676,41991.50173,38717.60025,36106.9773,33012.69378,34529.14139,35943.26568,34702.66273,33546.6469,32322.48379,31569.35557,32486.13695,32692.12294,36861.43943,42028.28558,45845.4036,49319.94535,49015.39112,48079.95699,47708.16169,45976.36974,45839.72826,44985.20069,43289.81663,41539.1448,40754.08909,42011.76835,37138.26392,32278.36355,33438.98571,35239.02449,34093.63785,33133.26396,32365.50765,32147.24909,31326.90164,30443.00201,30526.51552,30784.35849,30802.94341,31410.1863,32788.57835,34140.74791,33471.29828,31976.0287,34061.01928,36114.12427,36343.16594,36571.33776,36783.09125,36497.4060790198],
                [80385.2877677352,83619.55566,87037.74812,80989.78471,74948.41401,75911.55222,76877.35654,54486.63291,32233.92958,42319.44972,51517.07341,54323.85565,61204.89612,68162.60792,74581.84157,60997.0343,49578.4329,46762.09517,45966.06209,45467.22304,45566.58182,49652.55658,52831.18463,52719.35739,52029.33522,49185.18603,45652.90351,42842.68057,40095.63197,39230.63946,38402.18343,37387.38837,36445.66822,36298.99374,35370.69644,34917.96055,33861.66862,35051.8557,36067.13665,37978.50934,40030.40507,41788.15903,44410.11759,48738.47126,51816.35336,53581.75955,53583.46947,47008.48647,40814.73251,45400.77182,49817.23841,46565.39389,41395.53383,44264.88891,46954.62427,42500.35251,38397.13017,41234.12332,43753.39285,40983.24591,39001.58785,38824.07664,39246.94119,39495.03586,39967.45264,38902.97625,39280.52137,36690.56727,33521.5577,35264.03846,36084.37551,35178.21381,33846.14282,33627.27837,33803.58719,33544.78591,33489.12754,31488.88818,30049.016096009],
                [81511.497834235,84389.00575,84376.55197,79523.06125,74946.30824,74582.48385,74064.18409,60220.57117,50607.34088,50845.90756,50717.32745,50899.56394,52161.00945,56000.19435,60888.72635,55038.43456,49970.82236,51591.90233,53054.68839,47769.31841,43272.69985,49162.16468,55304.4574,52290.93837,49310.46981,47454.65348,44800.85784,40902.06275,36753.08263,37176.05666,37210.66599,38163.54769,38202.33031,36679.58506,34053.40033,33081.31976,33348.61324,35100.89875,38239.86579,44239.85861,49345.81595,45161.32606,41800.71429,47514.4223,52791.24096,52311.89906,52376.41614,46315.22123,40282.72602,44350.113,48354.48487,43722.02319,39190.46211,40416.20567,41753.10311,44118.94733,47852.34283,50739.55257,51863.81089,51292.40263,49067.02252,49753.7041,49662.35692,48956.59172,48351.97322,49369.30973,50068.81239,48564.17198,46727.6529,45562.30433,44160.10157,43551.81015,42892.03004,41921.31893,41023.6082,40489.62636,39890.95206,38693.41663,37463.583868986],
                [77529.5712266149,80654.09684,83938.31474,77923.9393,72418.55058,71862.06192,72986.4745,64378.63539,55785.91513,53648.58876,51544.77767,48993.54627,46523.28666,48607.60103,50707.81667,49749.79873,49571.94523,54301.49367,58980.66543,51401.6999,43746.58557,49943.27325,56139.16453,54072.9321,51843.98659,47329.7512,42806.10899,40543.69696,38095.7679,35525.8327,32842.85303,33099.81859,33500.68061,32739.13323,32514.98207,35445.46479,38594.05862,38405.02172,38417.93688,48473.25588,59862.19103,55915.08427,49189.91638,51448.40041,53219.26173,51247.77763,49412.36225,46341.98527,43224.43257,41494.90305,40062.3991,40043.38453,40585.31161,41122.24868,41703.20017,46177.31601,48065.30552,47861.94053,47298.0177,51014.25904,54638.172,54143.2265,53311.66603,51101.46867,49348.54753,51779.39731,54771.7905,53926.5727,52560.42144,51720.14751,51211.81055,50439.63158,50472.00838,49710.6395,47639.63465,49841.25914,49629.79217,47571.20834,45748.4034288172],
                [72420.8606236067,79480.71838,86432.82969,79346.9626,72186.02,76115.836,79755.60537,70596.01524,61330.52193,58527.03114,54409.9294,51666.23838,49068.17688,49882.0578,50867.42505,52610.69988,52441.59535,57216.16813,56078.88205,49465.03795,40980.97643,46121.71436,51725.2879,49373.80296,47764.74104,41449.49521,34464.29454,35638.60907,36940.41643,35238.97026,33579.7063,31408.07992,29312.30603,32172.52921,34814.14564,39347.90926,45936.37219,41857.27505,38006.36028,47852.77882,57664.70587,56609.27163,55353.07355,55326.90052,54505.55108,52605.13004,48588.47382,43403.49569,39782.53183,39176.16455,39285.50293,40118.82542,41932.67161,40221.61379,37991.08418,38497.03588,38890.11922,40512.53205,42077.95735,43852.28011,46311.72317,44855.23415,44989.36861,48276.65951,48419.35922,48983.5361,49083.319,51338.56293,53014.71346,51001.70316,51018.86946,49523.98314,51174.08707,44712.60513,38242.98505,47876.35664,57868.15581,57382.24052,54535.6423276325],
                [64526.3738358216,73232.18013,81672.75521,78951.78775,76055.71785,74582.66812,73065.62619,66515.82473,59425.49967,58484.656,56977.77117,56182.06307,54484.85145,51385.66082,51302.15084,49428.96954,47784.56827,51693.34332,54983.43278,46397.47225,38695.11528,44860.32947,51154.3724,48786.38317,46796.46653,39937.78825,33335.4177,34511.2961,36271.68306,34563.45293,32455.09031,29734.40827,27621.87204,30850.87951,35486.50545,42610.79314,51680.78495,52097.2544,50069.59306,49666.9275,52254.53756,54685.50717,56327.16831,55419.9975,53769.05742,48729.03686,43617.77149,41958.24714,40320.56497,39327.99217,38521.23372,37387.35257,36142.10427,36614.03467,36923.79606,35499.41012,33805.48228,33569.1735,33399.63825,34221.96595,35355.60934,36779.92089,38608.9827,39299.37816,40015.92872,40427.30423,40872.59698,41238.89966,41636.03403,44594.2616,47623.96192,43667.46242,39928.10064,39339.85357,38654.88409,45750.67098,52833.18923,51745.3568,50654.9920549328],
                [63166.101536198,67696.13628,71990.70733,70588.50053,68638.56662,72618.07087,76527.71804,70754.25688,64951.66399,58045.28377,51252.64024,51632.77347,52186.69985,52262.86452,52347.19903,49280.41329,46452.29898,51834.02442,57019.94609,49300.65719,41569.77532,45501.11973,50544.53606,48859.9351,47249.801,40417.65312,33560.07259,34528.16912,35801.04843,35867.88919,35951.46356,32998.29623,30071.33514,33767.13649,37767.84826,43963.67568,50656.44227,53785.55296,57225.3011,57933.11431,59065.95373,55668.88083,54290.83247,51005.63684,47454.18157,46278.97152,44560.46266,43216.99501,41494.65774,39287.86341,36933.91738,34984.8096,33043.90001,32119.27228,31882.2698,31772.62574,31026.26356,31325.40443,31621.91826,31506.75285,31407.48856,32814.48373,34546.85153,34298.03621,34510.45384,33842.21797,34868.65984,35347.36091,35920.79054,38079.30063,39451.20696,40353.48269,39741.15177,37092.19668,36531.73868,40476.96805,46519.32123,45491.09557,44589.221810435],
                [60674.4705599054,65880.89103,71033.12907,72392.73844,73706.10806,79164.7576,84530.73781,75698.54262,66805.6889,60766.24952,53746.78325,54692.35885,54790.40639,53898.42496,53362.23588,49396.2153,47072.92972,47471.28993,50290.7974,46542.46761,42131.51623,46322.83045,51306.6248,51612.97218,54194.41083,44765.6919,33968.74149,34955.36187,36062.71131,35113.89673,34166.27109,33338.66461,32438.82438,39126.37693,45045.29372,48833.80446,52047.1255,55450.35107,58853.84975,56587.17389,54321.54776,50852.85545,48329.07887,45599.28715,41875.35909,43330.77626,43559.13168,39347.51582,35881.72851,35595.78622,35016.56435,34172.77579,32791.33482,33951.13726,34679.35175,32750.23351,31243.74017,31470.34569,31848.86335,31252.08755,30905.74913,32257.02857,34015.45999,34648.42084,34268.66785,32686.08537,30209.50069,30672.77359,31336.01951,31389.28823,31268.07385,32835.79726,35561.46908,34700.67587,34074.97613,35490.61422,37007.62917,36846.97439,36505.1611506868],
                [56560.2123452492,62916.68243,67528.82346,68005.88947,68631.89017,72786.91374,77029.74864,72107.33942,68412.16519,64683.71436,61059.67851,58044.23233,55445.40867,54281.39489,51950.92033,49768.61086,47074.9564,48612.02027,49857.55728,45893.98844,42028.74618,46798.97307,51103.70695,51348.46261,52400.16108,42504.37435,32989.92384,31754.30445,31790.22173,32945.8104,32687.93427,34166.92022,35037.14508,42852.75798,50259.51881,52823.74968,54593.00212,54270.24413,53737.96926,52059.40659,51085.65024,47377.8786,43010.81936,42386.818,42020.34728,41527.49097,41696.27971,36957.99308,32986.27994,31645.7493,30709.29536,31554.88933,32380.69069,33151.72538,33828.15222,33724.97804,33563.63422,32921.88384,32230.64121,34343.9722,35502.50333,37039.61261,37629.58522,36688.85357,35702.03649,34423.00659,33152.96009,31517.61284,29971.15079,29862.47675,29884.6221,32427.51504,35009.14547,33024.77458,31120.08149,32492.34829,33834.49813,33174.70219,32484.4245222196],
                [59459.6919838833,59106.50979,58492.65874,64281.16775,71642.99249,75805.6799,81642.88253,77455.3247,72937.16584,68554.43054,64118.41408,60266.8503,56680.35663,53146.84505,50090.16452,50533.31936,49597.37989,50556.04853,51239.73998,48331.75776,44993.86336,48232.01924,50703.72905,50064.87971,49425.62722,41434.56547,33442.88758,34191.5811,34783.03489,33803.78705,32546.10539,31996.59195,31555.5569,40673.45593,48782.9291,51292.70628,53104.41786,55155.28229,56804.15967,50713.90402,44442.32073,45819.24622,44045.80536,42588.98195,40733.57821,38746.71036,36992.72108,34444.96346,32105.71422,33413.48817,34548.82447,35014.0772,35510.99724,36540.58814,36357.52413,35954.035,35245.35724,35574.01676,35225.51466,36622.10135,37139.53546,38333.62175,39267.82106,36907.27783,34634.60959,33435.5487,33844.8754,35704.90024,36998.86062,36560.2634,35895.96497,35571.86279,35290.02043,35640.23698,37117.3458,35173.01123,33405.08393,35113.07684,36640.4788718476],
                [64709.1228847248,67279.95514,69892.38993,73336.38425,76869.26165,76687.57096,76509.41685,74719.9746,72929.95153,67986.84057,62031.33916,64675.51217,65655.12024,58286.10881,50697.35527,49890.3678,47910.45311,47533.71637,47686.19109,44955.85543,42895.2927,44770.69941,47597.26378,47058.01831,47365.71702,39581.0389,32330.17942,32037.1787,32214.47454,32239.50979,32394.53789,32446.11182,32359.40694,33930.99318,36343.71736,43769.62067,51792.18141,50075.4106,48360.39672,45882.58399,43420.16295,42290.8878,41333.98779,41507.48049,40976.32097,38571.87101,35212.20914,33201.705,32057.61808,32624.06812,33443.8612,33260.09219,35269.6787,37380.07581,37085.17929,36738.73364,36773.21021,38100.01559,39864.34004,39514.32591,38339.05843,37658.27042,36333.3646,37103.28782,37720.14753,37591.08349,35225.86084,34370.26464,34709.88403,34423.14651,35749.2299,35983.14759,38591.62682,39098.26015,39511.27038,38643.80424,37696.30354,36338.88599,33896.3568995831],
                [61146.5886158506,70084.69915,76974.34872,79446.33262,81917.49054,79095.44601,76277.01079,73091.60349,71691.3396,68260.4094,64942.24488,62247.23208,59403.60442,56189.26894,52510.43124,50819.11579,48107.53557,48408.5383,48462.99007,46464.02142,44236.8301,48188.58531,52301.28299,48968.29049,43419.22193,38099.28663,33506.8425,34653.43306,35412.19709,34381.16491,33379.32774,33337.52854,34145.09308,39655.18143,46469.50713,49429.9496,50056.94786,49612.87776,47174.55533,45016.34297,42588.25728,41488.81854,40315.94689,37583.35499,34532.3093,32898.15737,32603.26096,33142.84352,33861.06486,34617.46475,34667.08506,34314.78809,34238.02906,35720.59644,37022.13979,38127.53328,39270.74415,41543.93318,43030.39164,39742.91024,36664.67561,36420.15884,38307.31673,37120.67728,36022.7842,38273.32152,40522.23855,38635.96351,36747.74584,38296.97592,39838.22615,37332.68571,34812.64306,35328.57214,36066.30986,35649.75679,35288.71555,37446.80679,39794.6139179886],
                [56850.3153483828,68010.31702,78524.02948,80174.59463,82846.65203,78096.5881,74675.56532,71687.92314,69185.37447,70493.94541,72099.58228,67098.66847,61762.24768,57322.1273,53204.94542,50559.67221,46651.88771,47679.20255,48369.80758,48785.86513,49295.78814,49789.09399,50685.59669,47566.22395,44494.1622,39036.39646,33630.53332,34238.58851,35238.20982,33780.93228,33679.38332,35020.58819,36328.97492,44086.08008,51856.50808,47974.76788,44024.52734,43462.74271,42916.21821,43450.35835,44120.51132,39237.1162,36292.62529,33591.93558,31648.77868,32105.79452,32622.54672,34294.57737,36108.13612,36856.30131,37577.39555,35635.6226,33610.3653,34044.91795,34061.1284,33915.2974,35124.30074,36266.69403,38277.18085,37461.59218,36863.55004,36450.45216,36442.55759,37542.63277,39190.10074,39849.30236,39994.8502,39633.94575,38977.28146,38441.78073,37616.69337,36980.14686,36694.01412,35080.96213,34837.5903,34174.96327,35295.43899,35995.07331,36579.1288683525],
                [57404.7598945134,65188.33383,72896.01286,75793.31337,79351.01286,77202.18297,75395.52206,75975.02934,76765.39797,73018.36185,71920.58123,69212.87591,66303.67251,60221.24298,54042.26131,52087.55777,49339.78047,47179.68392,45497.30931,45507.14164,46511.20155,52059.65995,56535.10246,50589.88964,41362.04984,36427.05549,34369.39105,36004.37441,37679.35129,34138.77144,30647.76455,35366.06297,39881.82587,47151.64298,54188.08723,48727.46067,42762.83533,44371.17042,45835.92806,43173.80641,40512.43315,36155.52194,31462.40751,30399.73428,29547.65891,30841.50633,32594.4187,32968.59952,34936.97422,34299.16462,35380.17282,36275.00591,36914.48393,35931.46394,34816.68042,33469.85441,32492.5352,32903.28877,33251.11511,35150.81392,36869.62128,36802.37643,36378.08886,35212.40596,33332.16891,34620.14205,36612.02438,37109.48401,37648.14776,37187.97467,38096.29204,37866.60173,38007.249,37471.11209,36895.23955,37360.15759,37864.71715,38811.88452,40107.8548563725],
                [65282.9357859239,67879.19829,75289.25736,78418.19396,81524.04322,79855.5207,78186.06653,72796.8615,71725.60569,74601.51957,76373.28904,72058.45865,68022.34038,60455.39163,55340.38795,54454.95865,54109.11749,52855.86664,51074.49251,49759.00406,48644.21037,51862.68499,54669.71733,53513.64422,55360.78781,47011.55876,39996.62252,38383.57633,37235.52104,33122.31626,30255.79347,37145.30374,43092.13011,47845.53914,52584.21081,44070.59639,35328.69684,38305.37118,40275.46196,38838.0822,37020.13657,34021.02075,30904.88321,31176.55896,30880.01298,32185.7043,34418.58739,35097.2242,36148.69154,34592.3152,33765.06636,35124.51399,36451.74563,36719.13662,36845.02374,35738.35564,34550.04394,34262.76415,33686.76642,33457.07556,32302.52376,33371.08902,33019.19674,32127.2156,31235.68876,32557.40776,33882.38572,33539.19732,33153.05807,33899.01641,34624.96008,34630.95344,34724.92048,34483.5183,34137.82407,35059.42581,35939.88936,36681.7259,37348.3101231254],
                [71399.9400091528,76058.09928,81190.93995,79844.84383,78528.04329,81383.80157,83653.54318,75661.42589,68022.4232,73605.06503,79486.87585,77396.06673,75036.46318,64855.10331,53647.11842,52289.64135,53040.95804,50014.26905,47190.857,49602.19673,51822.38943,52630.35305,52776.12793,54097.23042,55298.63217,50275.05866,45046.05968,40610.34885,36480.15744,34786.47636,35138.10506,37037.44138,38628.79565,41364.90096,44304.82153,38189.86611,32105.98905,34553.53343,36862.2017,35593.68988,32380.91897,31205.83321,28935.59982,33020.04243,36120.42379,34359.40353,32571.81618,34618.48979,36682.59919,36798.26061,36910.05859,35207.75714,33512.0554,31228.30164,29380.7449,30395.97364,33190.76592,33347.16732,33838.57877,33726.30123,33268.91829,33553.68088,33554.49507,32763.60461,32024.54262,32510.11399,33174.84455,31832.51719,31079.32297,32769.04752,35004.35499,34220.37523,32830.85669,32130.97668,31342.36898,29728.52888,29706.25207,29848.52336,30114.5936148061],
                [75354.1349866847,78472.49012,81319.42976,78981.30606,76422.21565,77952.17123,79481.19425,73026.9771,66745.18021,74152.86759,85432.73713,81106.85335,77007.39048,66855.09633,58357.43558,56153.11896,54341.52828,48582.27344,43828.49395,45762.78158,49713.36843,48815.42305,49008.42943,48920.53144,49131.483,47094.54244,44933.73869,44224.78597,43089.56784,36846.75021,30431.12136,32257.33371,35245.23962,43615.75699,50564.35722,42205.84431,32979.25428,32838.58948,33112.59654,31161.5545,29513.40782,30649.42346,31389.50476,33032.889,34653.45335,34977.87823,35543.29493,36225.65931,36648.85699,35960.44354,35837.54784,33113.7396,30749.35862,28382.46119,25607.55904,28579.10017,32210.3138,32467.2104,33195.84932,35174.04673,36605.6552,36111.62987,34705.73758,34719.11001,35339.58769,35638.26559,35255.41365,34601.3274,33820.42201,35543.05197,35796.03464,35625.71999,32528.66437,33043.8992,33639.21108,34457.14406,35292.75903,34582.98481,34347.0603742859],
                [69848.9303160158,75799.03216,80255.72645,80970.68352,81525.36235,78038.33583,74732.43843,67750.63449,59631.51966,68369.13686,78474.90217,75865.51229,71870.0846,66231.19824,62533.40653,61319.58758,59370.25359,51508.36832,42617.98749,47437.69445,52319.32863,50624.98601,48942.97173,50026.48911,50156.43051,47727.41585,44943.62283,42406.92215,38677.90172,34303.56085,30717.57464,27702.2899,24864.18615,40899.40717,56213.66711,46667.38552,37393.91501,35757.28389,35727.96235,33307.1696,30134.00083,30498.4372,31095.79951,32607.94628,34257.97735,34126.73566,35171.31697,36684.29124,38541.61965,37091.20081,35796.84083,33875.98999,31600.7763,31059.45501,30349.43068,32173.00985,33805.05472,35256.1086,37477.38488,37646.48288,37894.22323,36538.81811,35223.67135,35546.86064,35940.91328,36040.56208,36245.92942,36104.72008,35962.19529,36756.33466,37612.14491,36529.91572,35587.47551,35060.88484,34477.92029,35419.07473,36495.35088,35860.78666,35323.2705310011],
                [68988.3639001357,74503.37105,80391.30238,86145.68178,87575.76777,80788.7144,70494.54889,69443.79836,68170.39882,73826.12411,78746.03883,77373.95546,75555.13024,70808.91343,66000.73912,62886.09186,58750.44307,52924.89297,46720.597,48717.28212,50757.90852,50504.68732,49577.72371,49274.51803,49115.57984,45704.95076,42208.13775,38625.1711,35212.6279,33014.64758,30345.52134,30055.04306,29628.78187,41701.26547,53494.83552,47390.38736,41275.93612,39544.03061,37798.52739,35448.22587,31642.38284,31727.11608,32446.42132,34557.54366,35855.78454,36183.99962,36531.59264,36807.03552,37101.46266,35601.02109,34105.07472,32222.52989,30319.28187,31087.37687,32041.68028,32320.91823,32924.42773,36912.92273,40850.86283,41933.02054,42910.91181,40961.08717,38928.05966,39422.49675,39620.09964,38622.8326,36658.10329,36507.13309,36361.93191,37399.23355,38179.5397,38537.05103,37418.24479,37369.89225,36232.78771,36003.07795,36070.95629,37100.75496,37982.9868312827],
                [69936.9159910157,77794.96466,84778.51372,84340.89766,83738.37681,77820.72159,71964.72571,70982.89733,69346.04474,75476.20735,78736.33259,77600.60092,75207.34283,71526.16571,67700.64015,63123.87838,58504.90547,52857.52231,47692.51676,48395.25464,49168.21406,48171.73399,47114.98966,47294.08046,47079.27259,45389.53588,43712.93611,39447.74217,35247.50873,33917.02731,32769.36842,40208.70892,47445.62633,49673.48987,52385.30068,46537.5906,40940.96432,36614.48892,32100.26521,32318.03447,32499.01354,32075.74611,30808.00139,32601.24771,34710.99547,35095.06671,34883.18447,35235.00507,36106.3224,33077.35567,30453.35701,28273.12624,28564.02459,32500.24541,34059.40963,34416.73497,35763.65362,37690.29033,39952.69012,40240.34649,40882.76311,40279.93748,40045.47765,40345.59944,39616.7041,40655.40164,39988.00688,37623.65158,37119.26658,40272.12647,43441.92007,43352.52086,40569.1087,40046.68977,39529.57138,39557.18582,39576.57935,40427.04624,40315.8133662324],
                [70760.4257538413,69647.2749,71166.97752,76125.90079,81361.07583,75478.40544,NaN,NaN,NaN,NaN,NaN,71741.59144,70647.11779,70194.69887,71105.20072,65749.30239,59483.24216,53301.3917,46861.84977,49728.42953,52512.58809,49404.47508,46221.65072,45526.61321,48522.01718,46181.73048,43370.74081,36905.56298,31759.44503,31752.9983,32142.89127,39484.40743,47348.92858,48165.61962,50129.54871,45038.92642,40414.11115,35300.57497,29653.33986,29447.54409,29437.76448,30643.09984,31788.2388,34541.08847,37298.47571,35052.54763,32939.33197,34276.77071,35526.6377,34515.15735,33488.53615,31581.87067,29308.01994,33084.10256,36794.83085,39235.62699,41665.65203,40986.13157,38502.377,39110.46316,39161.25644,39202.43021,41945.04591,41014.42722,39844.72885,41249.82149,42615.12339,40909.48291,39046.98843,39664.53911,40094.22918,39489.29285,38979.42076,39534.40048,39484.26308,40430.18964,41619.96637,42008.06074,42683.1202611933],
                [77026.7944559386,79896.0209,84089.73218,80380.41497,75777.61655,72307.03798,68255.87169,55923.16508,45803.37149,52114.66084,61146.87221,68060.44663,75503.95255,71504.73091,66692.23616,62641.68065,58421.11799,52840.73081,47025.38202,47805.9321,49140.63147,44407.20333,40993.56279,44599.3498,47452.14399,45276.91708,42907.97347,39302.40037,35823.1884,34542.05584,32387.03256,40825.61664,49218.59526,48598.95876,47841.03706,43534.2442,39247.68433,35905.08949,32569.61422,33215.74872,33358.33808,32431.49514,32658.09754,32821.87024,32842.59588,32945.79747,33098.12515,33308.59247,33376.80126,36224.74762,38994.12609,35378.03002,31677.33674,35312.53674,38241.20649,38800.76598,39235.0034,36407.61329,33636.77292,37605.14942,41116.80073,42272.02168,43340.32827,41287.07674,39408.96905,38452.16664,39111.25708,39272.88057,39252.59831,38530.09185,37877.55949,39766.30927,40311.42287,39068.46499,37182.69366,37515.14947,40238.34347,41481.05979,42627.7976355383],
                [82037.8204241552,81739.00525,81026.30921,79633.76383,78179.53673,76070.99592,73988.84423,70796.19051,67006.41417,67348.52574,66664.7122,73414.12654,78758.57931,76422.93513,74459.19098,64785.7094,54210.42736,50199.44174,46418.01787,47291.28983,50470.08798,46814.94684,44448.22974,43023.42539,41847.803,41991.8911,41065.41508,35995.63651,30953.87269,31890.03361,33067.16583,41467.94401,49636.88843,50045.62248,50425.97912,44527.12905,38133.41201,33847.43586,29853.00366,33212.39257,37020.0434,35393.41983,33588.01259,32498.61168,30900.969,31914.89234,32986.82198,34579.53388,37553.39588,36807.19492,38791.13749,37352.55092,37304.33854,37811.66638,37849.02521,38941.22654,39968.10702,37862.57622,35163.35277,37382.76254,39618.77421,41083.93374,42642.11033,43193.7347,42533.73823,42141.29378,41007.68193,40978.59929,41094.2823,40804.06328,39562.20929,39172.8,39013.12421,39091.86197,39233.22791,39866.99394,40594.88128,44224.48291,44881.849573179],
                [77239.8078754247,79523.47289,80640.37483,79231.30501,77580.50964,78225.21643,78292.72408,75799.46444,71881.88506,72999.18864,72844.72566,74612.80408,75242.12385,81699.51669,82574.20306,74107.21749,62910.94105,56415.92758,49349.86942,48049.05504,46756.22161,46426.41784,46103.49209,42792.31262,39851.65539,39635.62667,39371.73093,35488.13111,32435.45096,32687.52782,33320.82734,42233.28049,51003.12337,50877.59689,49262.85021,44538.3303,38690.51076,34660.11642,30508.77177,33832.78886,36689.87017,35538.44099,34387.97747,35854.39043,37445.6948,36286.18373,32241.47092,36593.22492,40918.07048,39257.95601,37577.84307,38430.32536,39117.88663,38125.94546,37184.86652,36733.06646,36332.61354,36330.37941,36503.49581,37726.48848,38670.26225,39717.05696,42324.9363,43117.32691,43745.62507,42799.12441,41803.81465,41352.80825,40844.16479,40104.30031,39236.41525,42093.56186,45414.06745,43706.7639,41360.30647,39637.78494,38395.89582,40538.68521,42875.5307352755],
                [79283.2341697583,77697.20377,76554.55793,76696.05021,76527.13523,79248.88709,81541.55344,80919.36378,80297.40322,69925.79421,60476.58837,68555.58455,77693.39184,76815.37761,75223.744,69284.70093,63914.12223,55556.33459,46782.82126,49688.94219,52390.98769,49562.47225,46298.52914,43660.44046,41265.81769,41551.33693,41890.98299,35686.48054,29504.43015,31167.88367,32558.57168,41043.35313,49552.66317,49143.31555,48702.70502,42120.05598,35607.14459,34624.52329,33684.09869,35391.87283,37063.42436,35726.36269,33706.14383,34196.86921,34807.84361,35761.98888,36596.21086,38797.20117,40834.18006,39706.67163,38584.69909,38155.98158,37860.96729,38801.39517,38649.21748,36689.78995,36707.60094,36459.11526,36223.5214,37832.96107,39505.1952,40998.16293,42600.63866,43885.91167,45243.28873,45053.48509,44681.63063,41249.05338,38358.68146,37738.72617,37200.1552,40893.21701,43137.31374,43478.32938,43957.87735,41688.01332,40685.51483,43047.80603,45418.9460629951],
                [73950.9956431381,73999.76896,74548.24191,78064.57514,81152.91846,79760.18427,78011.20992,82998.54248,86853.1411,77313.38418,68012.09063,71796.02626,77784.64912,77585.45001,77601.61876,71726.91772,65569.82423,58194.40166,48948.66217,50515.07334,51415.6308,49553.91178,47356.5284,45464.80655,43347.833,39807.15189,35738.45523,32057.10065,28395.6035,32340.77941,36284.5871,42900.21945,49681.92331,48034.08031,46332.44603,41248.50526,36170.29705,32984.61289,30187.87554,34896.07913,40272.32371,36460.69424,31582.39034,33191.69583,35057.70661,36688.56807,39025.53806,37397.7877,34768.70101,36561.49369,39455.74556,39039.10785,39436.45609,38346.13794,37800.3573,36836.21167,34616.27921,36457.85406,36963.88251,38679.16042,40458.47153,45062.80312,49422.21479,46411.68106,44549.36211,46448.37242,48360.6192,47632.07202,43576.50853,42025.12668,38465.82654,41006.39404,44178.63298,44556.24485,44949.70185,43707.31443,42605.73783,45884.85732,48442.3973137439],
                [80771.1815483013,78285.26875,75361.74073,78405.07161,81201.77951,77052.60675,73228.76519,77223.93522,82495.39704,79504.81359,74983.17436,76257.23016,77450.78645,71051.13267,64822.24662,63762.8993,63464.67056,56960.90776,51332.13657,51656.40623,52213.49699,50204.90892,48458.55899,44405.78663,38499.3106,34360.45302,33208.30238,31319.01458,30358.59758,33928.80889,36820.83439,42999.913,49429.61911,45805.50832,44874.77468,38596.27029,33198.57689,33668.33289,33321.63857,36560.31715,39621.16477,37470.25909,35302.03874,36505.4694,37581.73063,39418.36283,41103.05906,39141.06162,37004.07363,38153.32601,39208.38974,38247.70143,37550.28643,39252.49373,41073.23722,33618.67014,26423.76275,32422.19591,38579.01157,38719.87583,37922.73837,40891.85596,42551.01486,41169.24269,39911.46984,42720.25009,45950.57131,46463.27962,46217.50811,44505.00879,42784.75914,43939.9126,45822.759,45111.2998,43527.08952,43058.14149,43232.9838,45034.74704,47567.3792164406],
                [76960.0389413515,75026.24474,72556.05748,77356.05724,83081.72668,78012.77191,74473.83905,80455.83916,85688.61359,81282.65616,76577.8001,78812.9868,80549.84404,78969.49708,78052.27804,70932.09348,63116.62665,57382.48991,52103.03023,54186.93802,57401.44927,51811.89831,48429.61874,43728.88063,38140.06438,36555.36741,34790.93737,32504.41677,30212.58771,34703.80825,39161.99077,46090.88719,53016.98748,48008.69225,43006.42457,37783.78124,32478.49459,33686.83474,34746.51852,36995.65602,40036.25904,37854.17999,35062.00339,37775.96725,39114.1628,38596.92542,38144.28148,37950.77712,37709.21484,38717.75114,39844.18585,39571.29133,39368.2177,42695.94464,45379.43797,39915.47016,36720.07386,39120.8028,41415.93756,38174.75774,34313.57737,34960.42092,35605.52526,34924.71963,34237.35685,35280.8192,35889.95486,39965.16353,44011.22172,41392.58174,38511.6062,38943.24924,38366.00104,42683.29205,46971.73411,45205.22507,43859.17057,44312.30683,44782.1738777244],
                [75122.2316064127,74027.24403,72757.97542,78261.62181,83340.2916,74967.4068,67842.97679,75197.09668,83995.57408,78299.25685,71657.21109,73053.99984,74134.7281,76157.78018,77346.69184,71039.85234,64049.05134,58091.34781,51920.12822,54282.0711,55897.10631,52521.70465,48857.63067,41976.81082,35810.42129,36661.06534,37838.332,33753.47845,29714.17022,35670.65498,41712.83889,46400.45119,51750.58156,47431.20474,43296.18737,37248.58106,31171.64857,33412.30366,35774.18887,38158.1187,40686.73015,38293.79641,34535.18807,36498.90761,38638.46493,37698.60704,36555.85152,38405.578,39607.12974,43007.17859,44460.61281,44911.94285,43811.33286,43562.49526,45537.89631,43808.15557,41017.67269,42318.13663,43262.10595,36869.21577,30530.87468,31194.00965,31763.46728,31331.06746,31696.60294,33437.25128,33453.61671,35154.61309,37650.86534,35412.31981,32828.70453,34387.39799,36589.29681,37823.59303,38988.18018,38553.74506,38373.68791,40950.6505,41324.1807132377],
                [73743.4590373433,73457.86125,72051.90164,78215.19806,83862.71859,78910.85019,74334.77636,73768.46185,72615.70507,68760.87812,63162.55407,67671.29221,68359.29164,70919.26383,67949.22948,66267.78611,61466.06841,58155.25197,54789.17211,53008.65609,51246.5321,48529.65692,45855.58283,40988.97274,38791.07344,40000.72213,39537.90106,34037.28158,28877.54041,35598.73745,42771.78293,45151.00984,49552.4305,45419.18959,44397.0759,37243.19513,31568.31824,31603.49979,32836.03771,36735.72963,40296.71936,38375.45882,36477.75576,36891.91587,37298.11054,37241.13125,39112.25221,39295.74435,39554.98895,42952.88039,46268.59986,43250.98279,40606.0214,43197.87128,45773.19946,44299.50578,42799.24319,42845.31827,42541.62079,35686.64218,28666.53657,29344.04318,28440.50589,30247.35765,32682.93056,33710.17507,34531.19074,35285.33112,36567.71261,35761.8125,35399.95306,35435.29833,35496.9804,35926.98045,36873.32095,35147.36585,33560.47542,34265.80412,35127.4948224098],
                [80273.4276875271,75002.66078,69047.85652,68685.79475,70951.94597,74992.37856,81876.91555,79985.55087,79019.80933,70829.79294,NaN,NaN,NaN,NaN,64921.36542,64990.16615,64510.44435,58947.91019,53137.37448,53065.62087,52873.04214,50337.8122,47225.56737,42781.51299,37997.23798,36857.38971,35729.55348,33223.02361,30752.85295,38789.50206,46817.38732,49084.43415,51406.21575,47445.70124,43538.71821,36835.31422,30213.01959,34092.3841,37760.76383,39317.69914,41809.98858,39491.39339,37242.75082,39909.33392,42744.0948,40277.70684,37788.16076,39819.66409,42093.73892,43115.19016,44479.72465,44476.72403,44459.57906,44877.11344,44335.55218,44463.33323,46674.95768,43477.76773,40491.08146,34899.85069,29570.42516,28818.91992,28072.67308,32128.38139,36217.24818,37874.14501,39696.8104,39272.7614,38757.02864,39867.85324,40969.97934,39812.01573,38984.48821,40382.9679,42417.20084,40614.43891,38776.0727,37004.08054,35098.6085609275],
                [69971.1264670603,68909.66138,69008.95119,71819.22329,76787.39053,79900.30251,84033.05637,83701.92723,82832.53244,69989.15577,NaN,NaN,NaN,NaN,78711.72341,72942.69529,66334.82114,61568.26792,56795.36656,55473.96796,53051.52246,50427.62603,47345.09153,42114.92774,37090.03862,35919.22665,33480.0126,32626.76963,31796.51289,39178.41424,46526.89266,52125.26796,58187.58214,49525.1303,41017.74235,35847.92394,30735.28068,33920.32594,37105.70797,41532.27614,46610.42101,42447.26635,37164.75504,40496.48507,43846.32161,41426.7039,39003.78893,40223.38449,41705.39622,43622.13792,45931.92227,44908.61522,44648.94512,46889.11067,46717.45525,44116.25649,42362.91627,38797.79143,36102.23097,33268.97863,30408.02079,32994.07942,35657.89644,37177.52172,37789.86077,38453.70076,40094.73624,39597.89305,39882.91792,39823.68125,40004.38672,42091.23758,42562.30677,42508.00933,42174.61892,41694.11293,40835.18805,39457.85506,37903.0856908449],
                [65057.9496677201,66495.22587,67009.99409,70024.48822,73798.50884,75875.66531,78373.44362,78416.64738,76990.56405,77939.32989,72511.39922,NaN,NaN,NaN,NaN,70225.83907,63942.92348,58630.46551,55637.50004,52321.60506,49286.23089,45893.83099,42775.36555,39851.60511,37455.68555,38321.92773,36848.26434,36803.90184,33327.8227,41970.58684,51022.94682,51453.80466,52186.3849,46918.89839,42004.25487,36366.95064,30614.75179,35009.21267,39025.10981,39250.24367,39844.21619,39489.24215,39144.60126,43008.11669,46869.25483,41488.18129,36538.24233,38904.04569,41331.32796,42208.61504,43173.75677,45605.94909,47977.52047,45953.43415,43726.61931,44312.14225,44672.46538,39684.79394,34046.50542,34255.41593,33719.4538,36267.61961,38897.73774,37098.12961,35526.06345,37526.13997,39845.22717,40173.31961,40294.63822,39023.57257,38250.46238,38719.36009,39112.62107,39091.90122,39836.62676,38899.18968,38594.6792,38097.17208,38823.75854217],
                [NaN,61971.3815,69377.58114,73547.2431,75630.18375,77345.18651,77224.71339,75284.00103,75159.06132,67924.72987,60275.01533,NaN,NaN,NaN,NaN,78358.58101,75061.63459,64447.59048,53883.15915,49456.83522,47350.30507,43176.63703,40022.90479,40910.12774,41521.79797,38111.38924,34659.36596,33828.98769,32974.88838,41281.97874,49273.41231,50697.62393,52180.9737,48103.89549,44107.00529,38362.89092,32280.14294,37920.84494,43124.3015,40370.7322,38267.96171,39950.27665,40570.1521,40415.00143,40687.98567,41999.59559,42531.77181,42094.54223,41334.02321,44976.85254,48490.81717,49816.28244,50799.92363,46522.28733,42005.8355,42688.9954,44035.80941,37667.98072,31350.39754,33599.64373,35886.93059,36792.53812,37646.14309,37376.92007,37078.80232,40605.58354,42955.37584,41176.68772,39641.55925,41039.56135,42481.08618,42564.13182,42781.79195,41924.83685,41188.30557,42592.97709,43863.11645,43352.50683,42569.1000195072],
                [NaN,NaN,NaN,69841.76221,73656.9141,73707.24002,74319.6032,76603.08724,78748.47345,59639.18579,41686.10476,62406.89021,82422.73432,76042.63729,70449.7188,69881.66918,69172.80033,63736.62955,57649.49482,53146.38061,49256.04698,43833.82077,38581.94041,37831.50744,36964.1259,35387.86016,33900.3119,35042.44013,36099.39607,42455.45353,48725.49234,50538.72528,52720.45295,48573.00388,44393.20618,38133.30006,31927.76068,38234.19661,43759.22287,40353.30356,36727.23169,37411.54387,39145.95025,41775.56178,44248.41582,41774.47478,39367.44419,41450.14819,41942.83662,46365.83253,48869.64718,50339.06473,51103.44881,47408.71543,43391.16773,44338.66265,45452.81189,38698.26044,31915.20732,32143.86958,32378.17406,36185.57995,39981.94302,40963.36847,40676.36622,39083.4873,40585.29567,37732.84348,34365.90956,35636.11415,37876.44732,40067.56163,41774.59693,42862.44815,43790.14053,43155.37607,42253.48595,41588.64133,40208.7363171954],
                [NaN,NaN,NaN,66041.40741,72701.6639,74868.09608,77272.79561,76202.07036,74658.22888,61565.68993,48737.60226,60444.26339,74717.86072,79920.55927,79562.97777,77054.35409,71659.49167,65946.11489,57898.23109,53329.40545,48881.64227,45079.11957,41510.36332,36973.44005,32423.38752,35027.65617,35350.3669,33189.30918,30628.44673,38557.12514,46550.7243,49266.66121,51970.23466,47908.79654,42226.74237,37381.24176,31841.66562,40082.37276,47718.12391,42956.27228,38394.39858,39514.07248,40692.76314,42475.07633,44267.93119,41785.85678,39005.00296,40108.33432,41205.41995,42728.69698,44235.82229,45665.0268,46400.57987,43523.39238,40921.27298,40983.95541,41461.83107,36015.02203,30837.48656,34365.27942,36414.42884,37353.01559,38173.97597,41349.83727,44229.4689,39305.80497,34717.62527,34645.72588,34811.72809,33126.74487,32846.15286,35551.8995,39037.13566,39155.38277,39635.6409,39870.15389,40299.33883,39927.61212,40006.8554063604],
                [NaN,NaN,NaN,NaN,73121.12127,75479.64747,78675.01848,77381.15675,76927.82399,69794.05712,62366.94109,70329.36138,77908.26443,77976.71563,77889.68009,74448.60649,70976.64394,64560.21905,58261.53404,52168.19329,48680.54687,42993.59776,39073.2291,37102.0625,35792.07765,34415.56455,33015.0967,31140.75912,29222.22383,38080.61159,48003.55514,53725.83117,59228.76099,49421.71787,39450.79659,35521.8604,31484.34551,38906.31342,46378.66548,40906.17176,35220.1784,40103.31355,44223.13733,44544.51621,45432.54417,43812.11518,41986.72228,42142.8698,42050.45052,44059.6886,46591.00408,44524.5662,43414.21007,44106.28582,45418.72678,46163.00711,46015.70583,38801.7277,31580.20329,33639.89069,35665.45237,39024.92489,42308.6613,43373.56647,44322.60173,40516.83711,35849.92533,36688.08275,37491.55385,38573.51808,39567.66199,42429.72063,44716.37508,42013.03104,38858.94459,39052.55688,39741.39013,38426.71438,37080.7271912902],
                [NaN,NaN,NaN,NaN,NaN,77197.87995,85061.2739,83121.42965,80622.30381,75690.4595,70686.68301,73237.23782,76218.00992,76435.658,76644.24746,73078.599,69772.37832,61388.54605,54766.33417,52043.9978,49712.91469,44787.77865,39333.91104,37940.09774,36268.34163,34262.22257,32461.27226,31065.21462,29734.93073,41017.34929,52308.65297,51676.69188,52246.90961,46524.21893,40812.71368,36046.53243,31256.5178,37909.10043,44560.46071,39143.30946,33337.88821,35146.51006,39421.44639,41579.1036,43722.80487,43201.92787,42900.27666,41350.75908,39066.67216,45373.45646,51526.90357,47693.26669,43833.75807,41811.96197,41354.31127,45625.36991,49616.04633,41704.62726,33096.10929,35935.69001,38687.45444,37771.50985,36899.17291,40200.72609,43296.85646,40742.71514,37096.57933,33171.19961,28942.51052,38004.28711,48734.82957,48537.70145,48300.29532,45169.52241,42014.68986,44439.50668,46922.72449,41786.34881,37116.7301964458],
                [NaN,NaN,NaN,NaN,NaN,57219.46351,81229.70824,72495.21975,59299.51688,60320.00658,65801.01355,71689.58554,74590.28311,64423.70201,61829.88661,62648.62904,63120.43372,54726.94884,45618.78322,47894.57646,50071.95699,46560.44762,40707.83825,39153.96796,35108.04579,33523.17138,28385.99619,30880.03121,30378.06738,38102.57007,46477.79358,48667.5008,51746.95462,46306.38754,40405.05557,36514.01318,32238.78798,39121.91268,46187.84167,39272.28411,32493.99509,38473.9402,44504.20779,43571.03725,42603.82605,43545.57316,44916.40662,44870.31686,44838.32849,47749.6456,50684.7764,46778.2962,43486.17859,43283.00999,43022.76267,46464.48372,49928.04918,40093.61545,30426.85143,33241.65196,36970.44335,38590.04023,38973.35273,40511.13542,42579.8742,37735.1754,33027.07061,32111.72967,29998.9121,41755.34776,53514.87108,54572.63421,56210.28504,48359.75017,42005.32106,42729.03752,43358.44122,40730.28582,36513.3926623705],
                    [NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,23797.66675,23306.17719,22814.68762,22323.19806,21831.70849,21340.21893,20848.72936,20357.2398,20536.54083,27822.77035,35108.99988,33599.71852,35601.38482,38242.57,38835.46843,38862.10348,38382.26081,37413.83587,36445.41092,35476.98598,34508.56104,32253.33866,29217.44683,29910.15089,37495.52302,47028.10825,47038.0606,46391.07376,38539.82231,30697.77109,30945.46131,31295.99965,34363.27981,37292.51797,38329.86933,38333.76048,36965.194,34206.43877,40392.35449,46534.83994,56737.51526,66927.55866,65665.92466,64667.89173,54644.58719,44054.51444,40961.47611,38363.32078,36839.46336,35366.6808970798],
                [NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,19490.85697,18936.03159,18283.60101,23745.48199,27640.43901,23898.74366,21659.5637091928]]
            ;
            var yyy = [];
            for (rowi=0; rowi<linestartindex.length; rowi++) {
                yyy.push(newylist[linestartindex[rowi]]);
            }
            plottest(xx, yyy, MassSpectrum.AllEleCpsGrid[14]);
            // plottest(xe, ye, zValues);
            // 测试时间校准结果
            var timeadjustresult = {
                x: MassSpectrum.MassTimeSecAdjusted,
                y: sumEleCps,
                type: 'scatter'
            };
            var temponoffnumber = [];
            math.forEach(LaserLog.LaserIntensiveONOffNumber, function (currentValue, index, arr) {
                temponoffnumber.push(currentValue*200000000);
            });
            var lasersignal = {
                x: LaserLog.LaserIntensiveONOffTime_0_1s,
                y: temponoffnumber,
                type: 'scatter',

            };
            var layout1 = {
                width: 1500,
                height: 900
            };

            var timeadjustdata = [timeadjustresult, lasersignal];
            // var timeadjustdata = [lasersignal];
            Plotly.newPlot('timeAdjustedDiv', timeadjustdata,layout1);
            // alert('OK')
        }else {
            layer.msg('未选择激光和质谱文件！')
        }

        layer.close(calculatingIcon);
        //关闭
        // layer.close(index);
        // $("#eleSelectList").append("<option value=\"1\">Ca42</option>");
        // form.render();
    });

    // 求线性相关，质谱信号与激光信号相乘的最大值
    function getMaxOfMassAndLaser(bigarray,smallarray,startindex) {
        var result = 0;
        // var startindex2 = startindex;
        for (var i=0; i<smallarray.length; i++) {
            result = result + bigarray[i+startindex] * smallarray[i];
        }
        // var maxNum = Math.max.apply(null, result);
        // var maxNumIndex = result.indexOf(maxNum);
        return result
    }

    // 线性插值
    function linearInterp(x, y, tx) {
        var ty = [];
        if(typeof x === 'object' && typeof y === 'object' && typeof tx === 'object'){
            if( typeof x.length === 'number' && typeof y.length === 'number' && typeof tx.length === 'number'){
                if (x.length >= 2 && y.length >= 2 && tx.length >= 1 && x.length===y.length) {
                    var txi = 0;
                    // 如果tx的开头小于x
                    while (tx[txi] < x[0] && txi<tx.length) {
                        ty.push(y[0]);
                        txi = txi + 1
                    }
                    for (var i=1; i<x.length; i++) {
                        var m = (y[i] - y[i-1])/(x[i]- x[i-1]);
                        while (tx[txi] >=x[i-1] && tx[txi] <=x[i] && txi<tx.length) {
                            ty.push(m*(tx[txi] - x[i-1]) + y[i-1]);
                            txi = txi + 1;
                        }

                    }
                    // 如果tx的末尾值大于x的末尾值
                    for (; txi<tx.length; txi++) {
                        ty.push(y[y.length-1]);
                    }
                } else {
                    return '数组长度错误'
                }

            }else{
                return '请传入数组';
            }
        }else{
            return '请传入数组';
        }
        return ty
    }
    // 获取日期字符的数字的回调
    var timesec = [];
    function getNumOfTimeStr(currentValue, index, arr) {
        timesec.push((new Date(currentValue)).getTime());

    }
    // 将off on 转换为0 1
    var tempoffonnumber = [];
    function getNumOfoffon(currentValue, index, arr){
        if (currentValue === 'Off') {
            tempoffonnumber.push(0);
        }else if (currentValue === 'On') {
            tempoffonnumber.push(1);
        }
    }

    // 数组广播
    function matrixBroadcast(currentValue, index, arr) {

    }
    //监听导航点击
    element.on('nav(demo)', function(elem){

        console.log(elem)
        // layer.msg(elem.text());

    });
    form.on('select(elesel)', function(data){
        console.log(data);
    });


    //

    // var xe = Array.from(new Array(96).keys()).slice(0);
    // var ye = xe;
    // var zValues = [[76812.6576104698,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN],
    //     [53230.9959339797,56707.96873,59835.97134,65175.35729,67958.47251,67840.89038,65805.52519,66719.71903,67611.22391,64499.95183,61598.06492,60916.72231,60508.72039,53949.81234,47355.32854,51107.36581,53674.86553,53167.92568,52404.39963,49093.89199,45787.03971,49448.89478,52749.66631,54264.8505,55783.06516,56135.21339,56525.23697,58637.56922,60868.16685,58469.17688,55798.08461,65047.94284,74543.02803,71267.5339,68243.37188,66849.03115,65970.15093,61138.54055,56667.76293,57174.57147,59909.31141,58140.90073,55796.5752,54126.37843,53062.58412,52693.80009,52683.47463,49331.46386,46182.78189,46516.41428,46917.98264,48095.68647,48745.96322,49592.57719,53587.85973,57313.58212,57567.76228,56265.73368,54856.99353,53582.68882,53047.52724,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,79297.06092,55317.06945,38056.54818,NaN,NaN,NaN,NaN],
    //     [56262.0375420054,56908.53476,57556.52101,63205.71623,68901.79834,70150.17613,71357.60328,67706.02226,63924.59871,59700.25866,57257.68368,59677.90179,61784.2898,54406.18484,47556.93799,51419.89726,54156.82867,54498.44458,53299.35167,50175.92917,49895.34851,50836.18683,53328.17577,55250.33304,57514.36035,58128.74219,55702.74414,57157.89415,58522.23667,58751.68405,59657.50045,72428.5596,87178.68768,77965.56037,65840.86757,62175.00045,59625.19027,54923.03646,50223.21575,50570.2885,50915.63363,52271.83591,54674.48758,52858.44639,51260.12062,49575.42896,47808.6372,46042.45526,45513.10281,45794.4028,46238.34787,45914.6076,45592.46877,44803.35312,43884.66157,42596.99529,41447.3011,44500.1643,48298.9562,48590.54966,48172.18731,51821.03874,54294.05726,50238.20754,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN],
    //     [59420.3332936621,64702.32102,69173.96127,68127.69235,67219.56475,67263.48512,67254.90927,61883.17627,56512.34803,55609.39967,55705.18499,57007.19059,58100.36325,53845.20731,49973.8506,48237.67251,46315.70427,49864.23355,53486.50914,55589.14072,57488.62779,55227.87493,52845.0101,52893.73067,52861.26715,53917.78788,55147.42081,57397.09421,58939.99127,64079.26181,68961.51491,73797.75115,77546.8484,67872.50424,60027.69941,57885.20779,58361.67898,53472.27358,50417.14257,51493.57818,52375.63422,53296.73582,53570.07753,51112.75964,48413.43445,48707.45833,49698.33005,47482.93329,45900.60506,47326.66021,48934.32537,47965.7843,47528.96429,48998.56414,50480.90526,47519.54104,44108.67559,44297.48951,44724.76788,45380.15411,45121.87766,46527.00451,45839.61246,43537.37993,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN],
    //     [58717.2677059551,63165.37658,67559.0301,67482.9072,68791.0667,65689.35878,62469.01152,58477.00584,54388.36629,52034.24601,49614.31475,55938.4596,62710.04299,56800.07639,50734.15383,47632.71298,45399.93017,49587.72104,53675.61209,57002.9618,60329.29614,58508.86902,57063.63763,58932.58557,60799.58998,61732.17266,62650.29996,62726.53017,62024.47709,67222.14942,72242.11457,69803.79335,68736.25296,63857.4783,59222.77573,58086.38739,56701.34413,53021.03308,49424.90285,51415.41896,52839.09647,49341.548,47634.06322,47790.43091,48191.13964,48957.13264,49693.56754,51199.1173,52674.09415,50742.16941,48730.06835,48598.6275,48255.75189,48880.94945,51685.83259,51040.10671,50921.72461,49329.90597,47862.27556,48825.80546,48904.19825,47317.15612,45244.05806,45495.58299,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN],
    //     [56794.2031397294,62410.91787,67780.71517,68066.23907,68430.0911,61328.35651,54204.60316,51726.378,49187.42399,52420.51861,54842.36921,59730.78095,65250.95603,56755.02253,49646.33802,47500.29348,47365.83053,48426.24682,50924.76885,55054.31015,60896.79892,61653.41126,62434.67238,62855.63877,62624.6171,60817.74956,59483.15533,65675.51909,71415.63054,74871.12299,76765.05583,68832.14885,60522.77345,56982.41751,52615.86866,52830.25102,53234.45677,49546.38992,45931.32286,50441.22143,55039.79926,52605.0303,48338.2942,48408.1435,50050.59837,51733.53224,52538.2225,53231.99678,53079.94705,51316.56468,48491.03079,48101.84315,47936.15925,52473.49022,54527.37625,50072.71443,46956.27972,46459.57331,46207.3762,46048.54768,46217.41489,46674.71427,47346.31903,47399.15163,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN],
    //     [58240.775151496,61335.4544,67260.28594,67736.38101,68208.21269,56385.51939,44559.27506,52169.80999,61202.55913,59891.32663,58697.20547,59454.97422,61524.49827,58735.26716,54592.05642,50305.58997,46464.84684,50554.14575,55388.66496,62512.97504,69268.11905,67083.56173,64617.99474,62003.8736,62234.24206,61739.93865,59778.54582,69815.50814,78800.2706,69729.3247,63232.23383,59004.08329,54230.79227,53543.46038,50369.97836,52078.98001,52955.48821,53207.10398,52862.53544,53500.38973,54713.09774,55814.48334,57002.26926,56771.65793,57108.06479,56096.49445,54649.5851,58417.69251,60754.41124,56607.11088,50979.0373,49906.3925,49132.17656,52153.40661,55134.15933,52536.32777,49479.47264,49152.9392,50096.89715,49409.00214,49209.3342,49385.1395,49206.33418,48214.48585,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN],
    //     [58721.8934178304,62760.85635,66938.00993,67329.19422,68123.64115,58001.78854,48345.88678,55847.93431,62910.9878,61222.94228,59526.57942,61369.18029,63634.2329,58631.73804,53638.13847,51957.30565,50660.26864,52315.86338,54439.33682,61465.85928,68784.72443,66052.64918,62873.40979,61434.38974,60059.85109,61123.38021,62206.18561,66529.33156,70531.60358,64287.50913,58886.3827,56668.0175,53647.43218,52026.98346,50074.02115,50566.5526,51189.58498,52921.27075,54902.46046,56739.76066,60212.84553,58711.9416,57060.50247,59603.41561,61013.60895,59402.1491,57573.13016,58112.86481,58720.48904,55432.37386,52200.89974,54267.80149,56373.77714,55323.22721,55287.03012,54357.77784,51639.26691,50740.27903,50735.01871,49099.90373,48248.11534,50302.59571,52264.04256,50270.23795,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN],
    //     [56543.0496383249,65440.14291,74190.77711,68989.26771,63610.14519,61517.57684,59421.24418,60213.94897,60925.37293,59594.879,56190.5332,61805.29974,66185.32252,61335.79522,56385.29563,57712.94198,59702.37436,57417.02088,57725.74302,60748.43407,66146.32345,60715.71642,57368.14649,60300.8379,65184.82196,66512.6719,68517.34361,64465.2693,61746.71068,58278.75581,55333.23624,53702.58408,51943.19515,51489.20948,50809.21726,52822.49539,54766.17975,55777.08487,56688.6653,56614.75378,56552.29312,56630.84095,55428.31566,58243.08577,60393.60839,58434.91597,54863.12497,56216.05927,57720.7158,55901.87173,54180.93218,54501.76745,55946.03311,56454.66536,55884.87221,54919.72936,54828.33797,54133.74054,54053.59457,56089.99283,57216.83016,54917.78848,52002.94588,49569.19741,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN],
    //     [65457.0806139732,68034.72403,71762.01293,68220.73257,64516.05778,64154.89781,63560.65769,64252.73531,62872.89611,60567.50123,59011.21807,60252.02651,62621.95943,61796.4798,61133.83746,59930.83075,59572.07162,65401.64324,70835.59251,67813.74976,65281.07544,64018.58243,62799.87487,62841.9675,65545.35123,64072.53329,61550.14945,60059.56212,58466.49317,54675.77999,51280.19708,51367.20529,52314.52042,53090.69124,54185.20456,53871.80768,54423.66786,54796.12924,55400.57549,54597.68082,54119.82778,52600.95924,51850.89837,53921.13124,57080.00557,58169.5587,56541.63647,58465.60722,59575.34858,58763.5776,57068.22078,56109.56287,55529.9808,54417.85287,53323.5594,56167.74935,59054.50271,58291.03591,57082.08164,56839.6801,55947.9598,54396.91859,53764.62239,53856.42576,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,58568.05889,59145.83817,NaN,NaN,NaN],
    //     [68830.6281543456,69113.55498,69281.58045,66621.34404,62077.309,63567.30663,65359.65743,63207.80234,60954.88253,65331.72469,69449.30958,64241.60156,58220.42671,59943.00216,60999.74329,61049.58441,62353.28974,62696.0964,62808.5376,62700.89395,62464.16438,64274.62396,65677.94654,66199.27473,66634.95633,61259.0197,55838.28049,55583.24832,56602.18489,52225.18034,49491.28868,52394.38376,55194.01231,55184.98778,55260.60883,56227.14574,57246.29706,57247.35387,57161.37912,57822.23356,57180.98225,57475.55759,58095.05475,59349.04521,60796.23662,59191.87644,57558.57394,57369.23954,57148.16144,58409.56849,59652.67569,56900.22942,54130.42288,54200.69478,54656.88144,55838.10683,55584.46872,53929.28194,52311.62622,54256.55173,56141.77025,55728.80616,55193.76172,55579.97682,55747.03621,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,61906.02,57656.5093,55831.2541,57259.462,59739.55286,NaN],
    //     [71847.6175023031,69463.07555,66857.58602,66030.29694,65340.81024,66221.04222,67142.85702,66761.6324,66353.98015,66589.57221,65815.00808,64865.64431,61499.51258,61917.27261,63785.40331,64760.28495,66104.55972,66919.06767,65704.00303,66902.16984,65034.27965,62187.54401,59101.75853,58678.16484,58537.12316,57955.00526,57154.97194,56036.28696,55250.86729,49307.19044,44383.40952,51977.1497,59475.96865,58672.36238,58549.1521,57947.12534,57136.94436,59834.64744,62324.96254,61740.01367,60761.97997,60446.43455,59131.14436,58345.26551,59326.82762,58760.35332,57727.76448,57880.08122,59521.44989,58415.67259,56721.21723,57280.80643,56872.1238,54415.91594,52760.12106,54506.18209,55777.35722,54112.97696,52496.47964,54824.89462,56863.93891,55684.30485,53930.19388,55753.56309,56686.0111,61260.12946,NaN,NaN,NaN,NaN,NaN,NaN,NaN,53128.91894,50728.66077,52908.92877,55277.45228,58141.69411,61358.8995860559],
    //     [64201.8328691416,65765.604,66854.23512,67655.0664,68731.98842,67057.47992,65675.40467,65306.89412,66103.87772,64245.25002,62486.24356,62311.45531,62158.88969,63017.0375,64754.27094,67070.4892,69391.91048,67496.30665,64965.4198,63779.53568,62665.63714,60660.50195,58493.3975,55714.40721,55178.32729,56579.55856,58164.51401,57554.57986,55507.73491,46611.80137,41760.42246,49921.33206,61150.89473,58825.51292,58746.88591,57362.62145,58827.38813,60430.08037,61617.05196,60335.35188,60345.97125,63632.17772,66568.18161,63152.15667,59612.68849,58606.47654,58506.47756,59496.78673,60735.36139,59561.45906,58093.63469,57638.87816,57173.17764,55748.71593,54281.69821,53697.98768,53045.52676,52800.56279,53316.23981,53866.49211,54114.33503,53967.1545,54225.84613,51613.69471,48928.61877,54446.41711,59989.35101,NaN,NaN,NaN,NaN,NaN,NaN,50038.65014,54624.95644,52561.56423,50731.13312,52735.31042,54842.0009368955],
    //     [67744.1447274673,68514.56839,69307.80824,66495.96054,66695.77461,66297.42337,69513.18601,70298.53042,70451.9932,66533.67337,62306.05983,64194.196,65953.66145,67658.34169,69047.34262,69369.48211,69596.89195,65539.70417,61055.8084,64685.52191,67558.044,63373.07437,57812.18535,55500.33432,53388.91088,55836.8345,58341.30803,57801.49531,57008.41723,56100.85018,51108.94508,53882.61323,57577.0681,59402.35002,61356.91263,59695.37363,58031.55695,59034.66249,60044.27597,61637.77247,60900.38553,62601.86441,66005.29442,62356.27173,58572.80249,58829.50726,59090.30546,57431.77786,55776.31021,56326.91668,56833.97201,55847.71411,54785.88741,57322.89848,60502.37181,59423.12869,55742.84377,53759.10238,51568.86609,52762.15205,54123.16981,53603.72478,53237.88444,51110.14617,49238.49304,50876.65303,54450.98898,55364.27815,56877.90762,50918.19678,45411.87685,47651.78619,48359.62315,51217.75192,54292.72126,52572.06565,51563.60898,52304.02938,53069.5336748672],
    //     [70514.0905958589,71220.49964,71753.31121,72854.21467,73331.85514,71460.90259,69118.8061,68138.8516,67012.72245,66079.27225,65138.32227,65530.77375,65587.65661,66809.74966,68535.66449,66019.11731,64064.36099,62019.08907,60124.80507,63988.83263,67825.97574,60987.44116,54518.34925,54373.20108,54487.06137,55102.44831,55187.64412,59145.96726,62555.38579,63025.64341,62549.24478,62938.48933,62374.43432,61593.60906,60634.1709,60095.65097,58674.66423,57590.07082,57224.22522,57115.63767,57231.65701,58958.24181,62584.53317,60026.26114,56260.96722,56273.17141,56006.92531,55038.30973,55669.42664,53910.31949,53084.47487,53098.17227,53208.7789,53123.49758,53077.57206,55369.1669,56701.90082,56211.25587,54647.89377,53876.7315,53206.36695,51620.54357,49800.7258,50896.96743,52459.01323,51546.62284,50197.56391,49556.12486,49804.34387,46360.69287,45255.50412,44937.72062,45318.15304,50277.11189,55236.76721,52916.8002,50597.30955,50218.2697,50559.7155824896],
    //     [70242.9842867857,67942.60121,65860.86558,70061.39488,74826.04525,70147.31733,65831.15235,65910.38006,66419.59541,67775.1192,69393.20665,69282.12085,69214.92587,66438.52523,65245.49273,67342.30778,69758.04686,64193.36334,56860.67724,61449.66698,66188.60981,61420.66052,56730.40107,58108.71347,58980.39383,59816.62795,60360.73833,60990.48018,61028.23468,56784.52722,53762.1637,55048.24943,57954.02529,60849.6066,65116.91718,61260.61131,58110.30308,59467.56475,61148.71738,60538.47127,59685.78253,60653.38886,61408.26487,60515.47176,59387.42374,56969.83057,54741.79486,54764.04579,55318.74822,55707.85066,56075.67052,53812.54387,52412.83161,52537.7437,52689.17394,53039.6796,53410.33615,52829.40768,51064.81798,50586.93753,49583.63516,48697.92788,47897.328,48136.62219,48303.85661,48793.80071,49272.36053,49827.19641,50459.85869,48041.4101,45795.41982,46095.90356,46376.7519,47135.71957,48405.06962,49253.24089,50602.60519,50527.36797,49905.5758684793],
    //     [61954.6828503836,64167.20893,67505.0501,69908.84267,74208.45153,72292.44493,71033.89848,68255.17879,66196.64351,64773.14692,64234.95827,64460.875,65298.63804,67132.15359,69984.1164,63010.92927,56684.30497,59428.81486,63633.11708,63564.18803,63268.57583,59970.36471,56761.46501,60369.93863,63638.68755,62965.66138,61971.59275,62059.34052,61914.59799,59831.75505,56108.10597,57528.13113,59172.25825,59381.59389,59897.20827,60824.13582,61702.86751,63945.6825,66221.99784,62207.09026,56910.39737,57751.9102,59690.20031,59001.97613,58220.73236,58722.9553,59191.49546,56709.3161,54257.99872,54129.73538,54230.95196,53870.46435,53635.23575,52965.23998,52351.1211,51364.40385,51527.81475,51198.90092,50716.03034,50830.71607,50484.49161,50590.23717,50482.77915,48441.44361,46354.78164,44315.7674,43783.66347,45876.19262,47584.08035,47272.84368,47323.01677,46462.14062,46254.6497,47770.78997,48570.87418,48427.41622,48527.80776,48862.36398,49231.8324355901],
    //     [62190.9161143549,63251.50842,64075.51198,67690.58033,71958.45633,70896.2253,69474.97658,67206.00919,65155.45835,67558.85495,70525.58598,69929.91123,68070.39869,63454.89243,59634.20098,63175.04582,67270.86932,67585.73229,67129.7372,63557.84335,58784.28157,61702.87895,63592.36075,63050.39191,61791.1543,62413.43642,61814.303,62467.21059,62892.95183,62296.02215,61717.21886,61148.14712,61167.91559,62201.99433,63242.19078,63129.44863,63101.28538,64224.20874,65127.44123,62645.35383,60427.43231,59644.20742,57360.52129,58415.99695,59230.20819,59153.39574,59312.42512,58454.02929,55540.15375,53930.26552,52703.13559,53786.45602,56156.73992,56193.53868,55488.21704,54795.042,53946.39527,51399.59072,48377.28516,49461.47107,50442.17841,47893.10931,45303.5945,46038.11494,47405.2072,47060.04,45370.04795,43581.81337,47336.94632,44505.07775,45756.02605,46875.72112,51460.49783,48697.63139,46043.02346,47206.25931,48417.27681,47091.26167,46396.4843221926],
    //     [67418.5544456236,67866.08571,66877.86851,66350.05197,66929.00455,67648.88567,68781.87806,67272.21883,65055.0375,68635.67214,71762.45405,68729.44722,65401.98474,66185.90064,61975.46437,63775.31586,63033.35857,63828.65461,64340.50193,61856.14107,59379.22354,60608.05066,61829.62255,63426.89372,66814.51858,66128.74633,64328.9185,59736.50273,57662.46537,58095.73616,58340.22697,59004.36041,60889.52094,61297.08401,62207.64607,59538.47057,59296.10195,59402.02133,61146.81806,59957.82865,58229.10896,59883.63338,61505.05037,60760.52511,59864.61235,56816.87201,55672.62251,55875.72525,56214.95745,55844.49951,55234.17129,56525.16088,56886.09667,56534.97467,56196.83952,54527.04786,52802.33772,52213.5517,51273.00119,51422.0638,49996.71328,49250.44495,46862.3001,47166.96324,47603.43678,46517.26104,45524.99315,46101.5028,46698.023,48833.01236,50587.14813,52340.09461,54462.01022,50276.06196,44931.79836,45435.43312,46162.57314,47294.54892,48423.9032308474],
    //     [69020.744749481,65828.0533,66135.13456,67544.49031,70844.97105,71135.06938,71473.62236,67959.59236,66032.64182,68366.38403,71387.41202,65007.17499,59046.80214,58440.10568,59014.31187,61550.34858,63114.09179,62250.59815,60414.16225,62986.57203,64055.21972,62990.20763,60756.61063,62494.96298,64265.22434,65321.1692,66469.56692,61202.45684,55749.20505,58542.61639,61001.18456,59906.86379,58831.48567,61624.42367,64384.70554,62274.31883,60301.25104,61098.41236,61984.62617,59074.05359,56346.79707,56810.79039,57715.22248,59405.11064,61270.26304,56592.2439,51803.94969,56148.36855,60263.41353,56021.92156,51602.98727,49936.92613,48343.97038,51105.63578,55570.54812,55810.14173,55468.04165,50441.77142,46110.77286,46985.26887,48236.53194,47847.64445,47446.14727,47563.65157,47589.9468,47729.26547,46800.61225,48233.42324,49484.39845,48437.5105,47304.4253,53817.88676,57770.16702,53830.45382,47272.93568,47658.99017,47956.88067,48000.72308,48041.1379506448],
    //     [67609.344407237,68715.5972,69760.21739,70955.5007,72060.17585,69982.584,68207.76632,68500.01383,69817.95765,70459.79441,72493.38625,67811.11572,63638.6978,62054.71792,59984.90646,62845.77166,65728.73667,63669.62566,61400.15393,61861.1886,62663.69683,61973.45751,62215.19739,65595.30294,69533.29014,67531.62357,65381.92713,58051.04497,50876.53277,55588.31003,60413.62003,59205.03759,58483.65203,59324.79517,60147.60651,58806.29545,57173.80351,58123.23726,59836.41408,59892.70964,60046.77873,60699.66966,61445.94938,60660.55791,59759.7831,53733.5303,47792.51528,53745.78158,57828.89228,55507.22293,50883.25467,52230.27197,51173.947,57161.24181,61463.26648,58554.80844,58696.91067,57957.43286,57183.02404,54394.71147,51657.01091,50935.47147,49903.37242,49019.06156,49794.20589,50888.71925,52204.3231,49864.40163,48157.66974,47082.76432,44145.28759,51324.5677,54389.84526,50858.26327,47258.82516,48420.31013,49602.88112,47754.78556,47039.6966268275],
    //     [69339.048575007,71133.6415,73142.01235,72756.36302,72051.72572,70789.72367,69839.38943,70516.39451,72578.03058,70591.5462,67913.74114,64639.9501,60597.88299,61632.73961,60894.00182,62290.47144,63502.70755,63750.184,64225.45386,64124.93399,63977.20658,64928.24206,65845.48175,67777.54881,66975.26088,62299.86942,59566.07021,51316.63659,45481.62094,52967.40412,59875.8279,59754.214,60139.80721,60609.66679,60202.9459,57737.90165,55103.37023,57510.5349,60743.98194,59872.59384,59111.99784,59023.85248,58971.35446,60187.85307,61598.33755,55622.3688,51844.90893,53118.40796,54892.3283,55055.51872,55131.62723,52823.32872,51007.8315,56738.3363,62312.4001,61739.06162,61116.09219,57615.96957,55241.39315,53757.30776,54501.32669,52149.82704,52850.3497,52628.09982,52574.92622,50268.60996,48170.6027,49359.87552,50888.91593,48977.04822,47119.19709,49002.62587,50895.82824,49736.99673,49302.00119,48418.72083,47570.71669,47406.02015,46834.816609015],
    //     [73251.045379647,73179.33962,72201.61134,76408.79983,78819.0565,75847.8404,69465.07273,74735.70578,80346.33939,73149.98051,65896.21215,66370.34259,66576.60487,64174.83956,61167.03642,60583.16087,60918.40493,63021.67172,66009.2385,64753.92074,63782.64412,64637.18735,65204.85041,66200.59712,65909.71813,66640.8873,66585.17588,52604.09097,38283.09329,47041.03483,57283.19849,57983.62391,58653.5433,58413.02181,58198.93774,56950.73988,55640.36838,57186.24805,58860.66958,58316.72876,57101.90502,55239.73904,54750.68066,57520.3283,60650.8713,57949.55619,55582.45914,55840.27693,56387.78083,56049.04494,55478.30375,56450.84932,56809.66915,56905.18334,55649.74113,56511.03161,57265.20688,56336.5747,55429.89681,53902.0711,52719.95475,57485.79089,62234.57898,60741.88112,59207.23208,58651.23857,56568.73934,55803.39682,55065.94567,54004.92508,53026.94046,51601.56073,51308.7022,51589.83609,52703.54597,53194.42003,52506.94465,48108.55373,43701.212284737],
    //     [70090.2575612541,72746.55097,75278.77464,72283.4881,70241.87987,71826.13125,73769.61861,72831.87627,72634.99429,69206.36166,66980.1816,67277.41962,66483.6828,63529.01328,60940.8419,58299.89482,55836.87922,61263.94473,66818.31979,66119.24445,64944.24557,64582.7409,63848.1389,56959.00777,49644.89771,54639.73058,60860.47003,49450.90686,38049.67504,42964.53065,47823.30751,51451.67783,55870.19472,55522.82702,55097.63472,56097.84329,57335.77071,57833.21878,57850.06721,56093.10209,54318.52944,56697.07638,57104.92584,56673.44924,56904.2837,57138.23144,57372.66818,57715.80732,57085.01365,54814.35612,51028.83109,52615.76538,55459.84415,56126.5912,54295.12937,53099.10148,53590.38009,54478.1407,55243.14414,55251.17618,55381.78312,53280.2413,50958.88368,50543.13368,51582.03207,51587.66469,53852.21726,56625.31167,56042.69953,54464.26732,54836.81518,56001.9958,57526.70637,56499.18928,55402.64012,54337.49483,53408.66151,55324.60284,55354.3717139063],
    //     [70115.2592936938,72543.0599,75318.25626,72641.24028,70670.15907,71952.1189,73506.51683,74575.94131,75205.19897,68532.83792,63595.12569,61992.05596,60855.229,62400.48975,66676.65869,66806.25464,67479.49799,68638.64048,70871.4374,71133.34016,71489.51565,69895.46268,68026.01718,60102.75383,53816.65929,57278.73227,57274.26131,53304.37946,46559.95977,49651.29447,52346.35174,54442.71373,54761.65544,57744.7023,57259.4113,56513.86999,54479.96868,54525.05761,55025.56406,55434.92255,55550.8456,54984.87335,54541.76274,55749.15189,57009.93944,59029.01359,58319.70148,57836.86724,56881.11423,55473.03428,53825.56229,55717.12472,58045.7099,57428.86168,56856.04742,56194.05677,55711.87854,54866.8431,53725.8324,54689.10637,53864.74859,51056.34897,49870.00972,52181.45253,53990.16432,52892.50769,52158.17533,52450.27236,52052.55978,55125.72525,57698.45605,59054.97282,60236.30359,58794.89973,57658.6056,56894.02665,56557.01637,57361.89705,57210.2429437151],
    //     [72202.3329206532,73168.86713,74273.36927,73702.26773,72910.38446,72965.44864,75238.86253,76235.94434,74650.99778,69625.13839,64301.04923,67316.18376,70413.92533,68911.35054,67192.08353,66486.49493,65828.85462,67397.12201,69029.56343,68907.11955,68631.46013,65377.23071,62254.24152,59452.36589,55734.12471,55147.18925,54433.40654,54105.82053,53743.1415,54873.43356,56771.29064,55941.07858,55187.70485,54902.82624,54616.65284,51249.357,47883.19315,49961.76883,52031.09665,52727.55932,56732.23514,56281.80751,53345.37355,54145.3143,54575.0603,54350.78546,53896.41034,55118.16799,56083.37669,54260.03718,52621.78535,55349.09158,58310.36308,57533.60327,56395.32066,53443.48576,51875.7564,51002.4157,50208.36277,50145.97695,50296.7471,50107.04124,49847.54837,51968.44363,54073.69549,53213.19341,51465.32539,51354.56785,51590.66362,53705.2072,55978.24952,55520.55525,55872.94855,55212.08199,54866.38568,55988.44376,56724.90613,56367.76931,56145.3826245257],
    //     [73755.320231058,73720.58694,74209.51753,73734.67401,73601.90257,72971.00556,72618.5038,71255.48147,69750.7752,67162.46294,63829.14997,64628.0278,65700.68303,68377.54412,70563.58859,71679.52068,72496.53179,70595.99648,68600.78253,67690.32493,67223.01391,57608.71243,49837.18697,47682.13301,46686.10657,47269.1053,48864.64281,51162.51822,53490.53488,56140.20313,58839.03651,57904.62999,56708.44368,52164.5551,47814.5131,48653.52359,49697.25629,50563.47249,50870.21503,53904.85338,56448.16302,54429.63672,53514.4035,51859.99157,50184.07519,51839.0909,54256.45202,54985.29989,54457.96616,53606.69781,53174.09846,54509.4135,55615.81855,54875.44471,55428.91656,55596.13776,54645.27338,54646.75366,53337.61198,55607.19406,57840.18403,55701.50898,53597.31583,53927.50455,52235.90766,50589.63518,49165.36696,48718.90178,49052.95034,51174.84837,53841.6679,52836.07842,53334.15333,51768.72752,50435.0454,52355.90163,54410.71451,54449.50467,55437.2962205236],
    //     [70056.5296404329,70456.78926,71674.88081,70114.28132,70020.06784,70282.93065,71765.69307,68560.14035,64831.77733,65334.4012,66861.3708,70867.38458,73822.30019,73978.14124,73386.29338,72235.13481,69235.92867,68966.81612,68285.15682,66563.9079,65064.53779,57381.70683,49369.2638,47658.47282,45137.17169,47925.85064,47219.88671,52745.16041,57694.12512,56426.00826,55224.02087,56088.34474,58155.98692,53683.7149,54816.96423,51602.15279,52975.15639,48538.40473,45267.74371,48662.05222,52180.88634,51433.08553,50712.53461,50191.34766,49679.09533,50737.023,51477.26849,53225.00751,54947.7652,52385.44814,49765.40466,51394.33436,52368.6934,52037.27463,52013.17638,49797.82432,47806.78686,49617.35456,51502.49465,50021.60977,48772.16274,51351.51966,54227.98198,54133.28464,54410.56451,53491.1282,52004.74637,51353.93777,51266.69558,51630.3963,52329.81583,51188.71158,49969.49765,53742.02464,56844.99421,54702.14633,52061.25527,53452.07996,55389.8657947633],
    //     [71273.0557784282,72405.57733,73417.9445,75208.95715,77063.93306,73527.68523,70595.99286,68322.23443,66000.83625,66747.3952,67523.20676,72059.25775,76552.36304,75873.32724,76209.1822,75652.10417,73889.41592,71547.48498,68302.0774,65024.74327,62658.57137,56218.00918,53868.16114,55519.35154,57111.56509,53156.91966,49223.54367,55277.32073,61323.39913,61911.55006,61294.87421,64105.09507,66656.7949,62530.06726,58174.95918,58629.4745,59008.18112,54957.11244,51245.82474,53808.05198,54504.20252,55199.5626,56049.57158,56891.67649,56542.96058,54571.59192,52800.40543,52634.34923,52631.709,50671.16339,48917.50532,50087.19289,51112.50257,52598.09283,53951.57141,50462.10356,47809.17026,47255.59876,46910.82117,47765.18041,48660.07326,49685.88055,50650.85582,50733.97167,50882.26168,52009.32071,53168.24212,56128.86192,58647.96618,58435.56494,58068.28998,55192.80476,52847.27217,54054.82612,54921.32122,55433.18285,55503.06376,52927.68488,50829.3871552372],
    //     [71746.7302887381,75252.14476,77694.31323,78396.41769,77755.10591,74219.96775,70000.63286,69810.68716,69133.89052,71859.8695,74508.47917,77408.84037,79959.96243,77605.54123,75276.83979,72688.89103,69953.28204,68045.35748,66187.82023,67548.00018,67978.64587,68734.47749,68228.23407,66460.29218,63860.83622,61488.75728,61367.40659,60105.76143,58510.43445,64325.97416,70250.70397,66948.49481,61999.12834,62582.40043,63133.45825,64009.48985,64898.39403,63819.37154,62067.9831,61515.3882,59631.73997,59432.00567,60508.3427,58752.2079,57109.05496,57167.72712,57444.67378,57060.44104,56593.89222,53979.1418,51856.30575,51382.51079,51659.67036,54149.29527,53703.48894,51465.59598,48765.31896,50495.17259,49662.26099,48948.38859,48196.06143,47730.09518,47258.72822,47592.05208,47710.27574,47206.05077,46850.53646,49398.02663,51044.93068,53212.25501,53483.27247,51675.27222,50347.49074,48911.98244,47896.64496,50437.39006,53236.58901,53687.43761,54627.2979753554],
    //     [70891.1775065767,74268.4983,77709.39129,78551.69552,78105.12957,73114.20147,67689.1901,68718.12363,70562.07658,71991.13543,72745.14015,74819.34979,77482.63119,74422.0161,72943.7957,69182.18623,66640.46674,67063.98974,67619.95053,69106.74256,70427.20189,68407.62073,66042.45128,64678.87691,66565.91501,68533.89857,66490.55972,57277.48111,49268.03766,58737.20746,66892.76001,66404.79895,64685.51732,67103.17058,68797.26148,65436.74941,63421.56393,66800.94011,68589.68155,67058.13471,65942.81964,66006.57708,66136.42024,64410.57963,62699.0985,61229.53524,61340.59991,59980.81901,58674.49159,57654.25548,56669.79315,57991.04544,59488.0975,55100.29708,50693.15502,48777.05473,47141.46236,48523.22142,49992.11693,49690.07783,49226.59869,50252.62641,50771.02428,50574.37837,50565.40812,48905.49946,47527.79504,50016.17614,52526.86216,52373.8969,52306.89921,49117.27484,45455.8042,48919.63444,52253.7254,50114.74476,47918.06651,49548.46313,51748.0278784972],
    //     [72223.2721481197,73584.85862,74960.10589,76435.13746,76998.83453,74305.457,71296.70391,70662.76519,70549.02572,73251.52989,76008.362,79322.78594,82497.42513,76554.21717,69536.78478,69999.6288,70415.96951,72775.56456,74865.38587,73564.90683,71367.26982,72145.56793,72540.69967,72298.17706,73437.57408,73617.81462,73548.7769,64215.87097,54696.90858,59370.59089,66253.98314,66730.46977,67068.43783,67820.05052,68610.81695,63869.60076,59474.32807,60691.5576,61421.81485,62239.40987,64622.18606,66378.6042,69383.41529,66147.81197,63775.62293,64448.82564,64889.58198,65275.40004,65613.18416,62610.42548,60352.93102,59834.25324,60444.00591,58052.98838,56162.26499,53720.84333,51167.79931,52439.54636,53693.37871,53010.51849,52369.53957,51530.52659,50670.8084,51522.26839,52641.73018,51358.39337,49571.49761,50063.69532,50637.88021,51491.93053,52369.32486,49734.95799,47237.11948,48743.1263,51003.27709,51189.99545,51993.96964,50304.6191,48977.079727147],
    //     [71985.5530761057,76843.38824,81296.92432,76770.54836,72606.47908,72112.18021,72904.68607,72495.6007,72827.49527,76552.41768,80102.19991,77270.47602,75013.56132,73673.05571,72124.04191,71285.12261,70633.16241,72283.91992,74852.85968,76017.78909,76930.85314,74857.25494,72797.94314,77453.17056,82084.75515,76661.75347,73684.82837,70853.02667,67902.51749,69976.57457,72088.04827,72574.48126,72483.91433,68568.79255,64606.10451,65706.53784,66771.06649,64563.32237,61774.21473,65750.73098,69083.68149,68431.2847,70170.20733,66698.81294,63313.55216,64210.9192,65245.34166,65243.04038,65715.48678,65055.30899,65235.69297,66606.865,70044.08,68860.4447,66143.12341,64754.86291,61675.45826,63129.63037,63755.40929,61146.50997,58613.34733,60676.04203,62647.44056,61117.70216,58407.79278,56313.76896,53834.11613,52561.11812,52947.40195,54952.08731,56813.38391,53768.18454,52125.97206,53547.44361,55458.9117,53269.45702,51310.52038,52211.76899,53438.1221392608],
    //     [75537.7652766371,74886.16638,74809.92808,75402.29634,76785.84326,76168.77859,75664.58919,75510.8222,78051.03681,78004.02135,75425.33541,74883.28048,74219.77866,71621.09233,72203.86799,72466.15294,72761.35833,73824.54296,75679.41669,76198.24734,76823.27827,72320.5683,67646.32279,70042.72141,73020.67649,73017.36274,70232.56388,70038.20456,69737.51113,69892.42986,70084.48804,71060.92759,73498.44008,71387.06703,70074.01414,70232.59706,71369.33595,68862.52839,67138.94785,67750.56355,68643.79375,69579.63153,70673.0879,69957.17635,69100.31316,68748.01889,66575.85512,64733.1013,62916.12177,63323.04556,63705.05422,63020.20632,63172.40596,61328.0473,58865.47401,60691.19324,62361.3884,62067.10733,61425.16462,63423.15226,64217.89583,63678.90654,63315.68384,61522.39145,60280.98024,61177.09172,63247.00265,63355.93941,62649.73747,61513.98088,60063.7485,59825.44032,58899.80498,56070.83639,55097.11613,55914.12122,58594.41768,57322.63088,56893.1941304652],
    //     [73798.506159232,73988.08736,75160.38801,75111.74787,73810.41993,73614.12107,73413.27384,73980.76336,76101.55929,74807.95051,73666.73356,73464.03666,73376.37928,73561.75955,73227.67622,76733.36286,79927.86076,77403.60435,74258.67315,73189.69297,72229.30939,70834.48553,70479.74614,72640.8582,74891.65937,71299.45323,67691.91615,67222.84841,66851.3241,69343.2458,70048.88867,68927.21056,68013.05455,70937.06368,74357.9475,75762.45157,76585.13003,74368.57567,71756.91,71024.09924,71762.73255,73707.43308,72406.68058,74305.81946,74455.0647,72685.13937,71157.83502,69754.68238,67603.52389,67346.48063,66366.97011,65119.46352,64341.86267,62089.96183,60460.66732,61823.85785,63944.03872,63376.777,62791.79946,62237.0013,61677.40478,61675.29014,61679.32296,61206.9872,61230.36519,62806.51631,62998.7866,63728.54741,64466.67008,64289.9155,64126.96238,67607.79928,70623.83326,65166.58438,58841.22439,55276.10414,53614.7823,57933.97374,63340.6451010871],
    //     [73828.7862570721,77608.74072,79804.09041,79215.69726,76698.37771,78720.3049,79791.18976,79803.06214,79475.39383,79014.44841,78316.56555,75401.5686,72561.11761,76292.19031,79936.6821,75968.34488,71911.4796,74281.62716,76015.7659,74209.49188,72090.05628,71724.58845,71437.3329,72262.78315,72830.42579,70869.85936,69724.56887,72825.5658,75873.71206,73399.57631,70927.78032,70096.6497,70347.31819,70227.59287,70164.29641,70865.57362,71463.62144,69312.81274,67498.94306,68230.47342,69753.05784,70557.97445,71548.66106,71583.9319,71599.01184,71682.4571,71848.41103,71231.2915,69429.13167,72580.54591,73265.07037,68065.07467,61704.42271,63339.83019,65679.26536,65050.2495,66152.17594,64638.87954,65679.017,64358.18791,63195.2632,63992.17284,64964.54975,64919.07428,64813.96997,62002.53513,62560.2564,66428.11301,68156.34516,66060.8695,62631.70665,64262.97788,63476.19779,64711.9007,65239.02516,65166.8114,63403.34977,64662.82278,67212.6713134185],
    //     [71913.9893122127,72345.02415,72856.83246,73999.58626,75996.58723,77412.40429,79285.36823,79882.50721,80847.96041,76729.7002,71652.01152,72772.67726,76142.88772,77714.09753,76699.70143,76320.56093,75233.88211,73464.66413,73418.82157,71395.91878,69863.09201,69826.7279,69510.31158,71045.04933,69962.46176,70774.85635,71966.81725,71795.22795,71460.53431,72056.56164,72082.7327,70824.20799,69846.38227,68937.39599,68876.94012,70207.67219,69939.88363,71490.93333,72267.01046,69269.85366,66357.39115,66818.09512,67332.40282,68831.55431,70089.81775,72035.65929,71129.85415,68612.23777,66182.14492,65433.55384,64609.20187,64998.22638,64726.59834,71213.63418,77075.41196,74790.19974,72310.08773,70911.93,69817.25289,70637.60041,71359.26988,72093.7952,73450.33663,72424.8292,71020.94472,69369.37426,67205.9919,67494.51998,68985.09016,67887.73851,66895.8067,64351.81024,61243.1024,61378.05497,62099.82306,65185.78023,66973.75709,65455.0952,64603.1043997744],
    //     [75064.7210331781,69099.58685,65930.13333,71584.85688,75151.98482,75812.78383,77195.09197,75749.11009,75155.12409,74362.07053,73582.1937,72894.21548,72222.03974,76789.36704,82399.54396,79694.9847,76738.94235,73812.86276,70669.57908,64158.00279,59503.01617,63098.1514,68071.92046,66415.93596,65623.81394,65945.01715,65913.79394,66492.45418,67010.14461,68566.17016,67899.33723,67179.52284,66531.72661,67414.11778,68168.29735,72088.5085,75342.72312,74128.9994,71450.69952,69437.63677,70018.42163,66468.59909,64447.68533,66787.96339,70551.98399,67151.04076,64928.83935,65547.76573,67308.72769,66827.10979,67025.45327,67316.45425,67796.00452,71271.82936,74749.90809,73633.70678,70918.58362,69874.97478,68970.01388,72803.24668,76776.46595,76992.47598,77572.69396,75027.59714,72698.17309,71043.40982,69744.14166,69286.93024,69030.41838,70023.04233,71106.71812,69020.07037,67046.78451,68455.37173,70139.57773,70656.84734,70771.31614,69559.63997,67437.2476844993],
    //     [75311.840534847,61694.55783,47795.16078,62296.41715,77070.47933,77800.09499,78316.57362,77204.92525,76201.78234,79502.43367,82375.50824,78298.59572,73607.35132,77518.03646,81428.41403,78266.23394,75089.71549,74314.60868,73634.82992,68298.99608,61807.42638,66461.81564,70625.47761,67353.28973,63742.78654,61184.47798,59102.13889,58490.57938,57509.53517,59253.35945,60993.33641,63614.85597,65537.59691,66535.23623,67379.0729,67935.22764,68470.02362,72188.09796,75382.44139,75004.81164,72617.226,67410.95883,67356.60975,68601.20396,69627.71688,71803.65507,74039.48662,71823.6284,68134.03494,69666.95639,70365.81217,69796.70949,68871.32842,69885.32553,72533.02145,72559.95551,71542.1852,68247.43144,66082.09758,66263.47777,67135.941,69573.2168,72703.69713,71955.0284,72552.39787,72621.58641,74869.76007,74944.71072,75229.88847,72440.09066,75094.86649,71623.57949,73741.87391,76164.45874,78377.41393,75227.53454,69970.6533,70791.72131,72698.05512345],
    //     [68313.5151554066,61110.93926,53837.16638,67631.33197,81045.53168,78415.24298,76340.20594,78749.58972,81662.71049,82750.97093,82232.92734,81131.52699,79111.68493,79871.40311,80964.68927,75400.37728,69976.52086,67805.90557,65610.24781,61547.59124,57475.68604,62262.40876,65313.63389,66217.15892,62740.95527,62522.02671,62863.09284,58018.92297,53970.20687,56072.00374,58180.20775,58532.20026,58996.11421,57692.6415,58541.43625,59711.69537,61904.4974,63273.40126,65055.1837,65248.94566,65442.95388,64419.43592,63396.24411,65301.97129,66631.81516,70683.12969,71321.76004,69749.64982,68380.24453,69069.42334,69630.55883,72548.72274,73592.81828,71824.24086,70590.69605,69654.39317,68686.38809,69901.54226,71256.78975,70141.17564,70750.33085,70422.09608,70899.51532,73043.38004,74026.10848,71141.76412,66369.25532,66570.50501,67978.19121,69917.74244,72213.47597,72165.57021,73661.18685,72543.87286,70686.0462,73485.10713,77110.03229,78089.27877,78888.2003123871],
    //     [67119.2194672088,63778.6166,55698.46972,66931.0449,79567.91379,80244.78158,80048.16095,81399.98282,82722.15869,79971.23455,77385.81976,80073.85163,82817.95335,78642.17262,74630.01942,66719.72631,58983.02455,59576.80277,60430.19823,58109.25989,55792.84617,59641.18028,62261.11645,62133.83985,62648.7933,66813.78522,70752.40688,61435.27198,51886.38745,53443.8696,56158.4925,54068.37829,52418.1839,54286.41253,55958.09069,53757.37389,51683.29667,52224.75502,53457.56209,56112.39603,58767.92688,57543.21363,56070.75719,57083.99118,58239.45176,58748.8615,59646.26577,61300.80932,63543.05128,62760.78707,62904.22174,66021.42242,69241.16348,69641.52214,70120.86666,68635.43825,67826.04606,69830.56055,71608.8875,71102.25668,70877.40566,72944.90609,75760.8132,73526.98742,70929.22818,70362.25983,70215.31064,70651.20327,71076.13428,72239.96261,73354.49631,73285.06902,72870.05012,72461.30922,71708.79984,75072.27944,78385.42443,77052.88898,75219.6682461824],
    //     [65639.5405576345,72869.3803,78950.54809,82491.32825,81852.2643,82573.33522,82419.81879,79311.36525,76088.10807,76686.91381,77232.11996,77822.72641,78587.49094,72985.77469,67295.56495,63601.15916,59700.48446,60386.31154,61305.4305,55586.19299,49537.25406,51259.00093,53038.63946,52259.65794,51357.40317,56293.33596,62185.54357,53019.63145,43982.72605,47172.04293,50190.74946,49227.53423,49065.39921,48067.8308,47093.57369,47273.05002,47697.07858,47105.783,46990.18987,48485.0653,51107.29967,51649.65352,50768.32447,53387.59613,55997.37154,55510.82449,55012.12443,55734.39965,56706.35753,56708.22564,57385.00626,59220.1264,61151.37527,60782.17755,63973.3848,68089.08326,68489.42255,68286.43749,66609.30582,66310.55405,66492.99675,68728.393,71421.24194,72023.01014,73134.03567,73859.45932,73856.62389,73005.04063,71607.16138,71209.22633,71332.34574,70867.47894,70977.4351,71266.72931,72100.71143,74093.05168,75588.3679,72072.90974,70878.3947247846],
    //     [78152.9977440262,72504.18672,67645.71355,72006.86104,77217.90318,72568.09245,70664.3519,73638.86418,78930.34571,83714.30119,85127.0881,79628.21604,72909.13953,68206.21081,62510.42578,60305.7139,56041.61962,53302.32423,51295.89022,48517.68783,46404.77339,48205.57795,50610.37479,51523.58093,53519.07812,58665.8127,62445.12588,54709.35554,44877.06751,46501.86122,48380.44203,49936.72844,51904.16979,48935.49812,46822.45137,48230.90828,47453.75584,47307.99246,46203.46409,45488.35215,44779.95939,46175.90684,47649.02604,47090.95523,46648.68593,47459.31696,47884.52354,49615.84043,51460.37851,49910.35533,48661.12881,50446.13319,53420.39935,53306.85008,53329.76962,54545.54014,55814.51227,57748.85192,59765.57692,61475.37316,64093.38438,64877.63546,66534.9413,67945.04507,68270.56746,71031.35954,74176.89721,71557.81595,69079.011,71748.72286,76024.41199,71333.99374,65771.64397,72172.4909,78420.81662,75155.78182,73013.94884,73360.55229,76611.2098620417],
    //     [80266.3951908114,76901.42478,74590.68251,75124.08705,77201.41075,73545.24151,71079.47017,76888.46891,81639.634,75732.26425,69893.86401,69331.28071,68922.86339,63180.23516,55921.33492,52755.70278,49633.627,48092.81818,46609.30879,44319.21872,42878.0381,46949.63422,51396.70558,52970.29765,54164.1573,52359.30957,50824.83579,50105.60538,49196.63495,48765.53045,49587.68603,52548.24031,55097.62409,52069.59035,48543.37402,48087.22974,47308.18388,47274.54659,46590.22364,44512.42613,44708.43843,45297.47619,45152.09072,43223.66391,41961.67743,44180.17141,45833.44991,46061.55512,46613.8271,46864.39766,46751.20858,49157.05859,51307.88233,48394.68919,45134.41147,48311.23737,51935.71361,59324.05325,65892.51761,62106.21614,57827.93999,58207.55842,59319.28754,61123.81009,62460.28139,60842.34039,60200.64221,60657.9898,61193.10297,63408.70022,65811.76605,64246.78036,62411.08166,66177.12726,69972.13037,71735.6494,73719.34911,72690.95094,72445.0739888431],
    //     [79909.538644252,75835.66791,71884.7548,74071.35747,75883.81526,76387.70936,77752.46616,79128.73548,80637.31208,74017.44204,67079.1631,61928.70317,57167.79942,56075.0976,55051.2031,49738.14718,44382.38017,44767.31238,45016.15309,45634.60261,46570.98519,48005.42185,49463.88944,49268.44554,49056.28068,50837.92504,53244.92498,51799.8266,50077.31829,48479.14158,46755.03902,49702.13978,52573.6991,51572.60226,50418.52338,48069.47157,45689.48326,45708.7621,46495.63936,46226.79859,46740.46898,48333.18643,51106.52945,50639.45632,50204.01089,45980.74986,41789.54675,43724.54521,46373.82324,46277.33812,45783.03932,45882.4971,45012.7366,44278.14502,44808.37025,47225.92968,48676.2825,47665.26736,46261.22933,48171.34461,49951.28442,55542.56082,60380.90494,59115.60261,54263.04119,55693.24893,56150.02554,56947.21033,55505.00158,55826.01425,56100.66605,56553.36805,59051.1738,62215.97372,64737.49808,66367.18747,66672.30536,66004.74411,66649.4912160204],
    //     [70240.6138323352,71860.3955,72827.50625,77005.68749,80142.82257,81440.29605,81624.98666,77619.43006,73054.89332,72154.40225,67820.89241,67072.55993,62897.51543,56309.19137,48789.09637,47566.32042,46841.17716,47525.87365,49152.09896,50971.8867,52898.66962,51799.38161,50970.21403,49951.47062,49685.08614,50715.27374,51870.76231,49821.79119,48161.20315,48318.3571,48373.39859,51655.55857,54577.17457,52869.49769,48973.22677,49055.18103,49247.39083,48459.7562,47846.40805,49582.93446,51203.11721,50957.01921,50598.05726,49525.97235,48422.11555,48222.76913,48701.40454,49905.94437,50907.69133,48251.43592,45788.88503,47408.37213,49536.50356,47487.63903,46525.65044,46174.24216,45838.70902,47031.11729,48231.62282,47518.76173,47352.5657,55330.69443,62200.43858,54208.41217,47432.70304,47489.69696,48162.27864,47339.45674,45649.30343,48984.46555,50824.57339,51127.31634,52948.71159,55602.09556,56357.02318,57519.23137,58956.47167,57581.493,57792.689739379],
    //     [67785.863227299,67331.87312,65999.74106,65444.21232,65973.7336,71817.95524,77665.09469,73212.63126,67927.37905,63578.08509,59550.19678,59433.57189,59455.04533,54776.66059,47683.95752,47510.45037,47347.80404,47985.0418,48608.57919,47658.55927,48479.8622,49564.79617,51212.32764,47919.10235,45255.20637,47301.8115,49647.10795,50892.02622,52346.18684,52917.18872,52972.63515,53782.51224,54220.93692,51215.08245,47925.24285,48133.73135,48114.19563,47005.41903,45761.20194,45490.80619,45995.71203,46938.06511,48086.24437,48047.39718,47349.45425,48202.37639,49257.47746,48601.01915,47713.94412,48064.25719,48240.55201,46672.90479,45097.53608,46913.81281,48755.02,47817.3458,47942.62964,48685.00928,49085.90365,49439.68059,50354.96258,53647.78892,57886.54748,54547.1053,50737.32671,48381.2224,46369.66251,44613.69484,43008.56179,43830.39469,44931.73506,45832.27347,46534.64084,48761.22469,50917.64857,48535.0563,47298.57902,50267.61923,53828.017608817],
    //     [68867.0030991446,66071.06549,63304.86942,69612.54288,75473.37581,77463.15609,77002.91713,69503.73602,61566.53203,57757.30068,53747.91364,52274.89515,50906.83149,50661.64641,50443.40631,51317.80738,51927.22073,49930.19285,48300.0633,49906.7368,51687.75848,49516.13455,47362.63025,48681.10725,49973.38507,52564.9439,54918.69151,53733.71947,52247.61267,54194.79557,56043.11108,54470.25203,53281.21411,51723.83794,50395.29456,50753.00445,51007.2988,50189.30922,49149.80477,48509.63984,48755.67708,50905.53584,49428.24912,47892.35141,46180.10889,46745.54406,47311.97501,48421.85697,49183.31628,47542.19198,45713.79327,46743.95483,47444.07558,48880.74603,50708.75621,53257.44753,54978.87947,52314.4208,48639.11911,50298.57371,51877.67911,52977.12482,54357.63265,50455.70253,47281.18148,49497.02212,49540.91664,48321.40032,47568.15911,48440.44694,49461.44729,47331.51452,45411.32068,44882.01534,44732.44529,46846.87568,49617.24729,48953.90249,48581.6382156031],
    //     [68261.7507851033,69050.23889,69618.10821,74482.2034,79092.33815,75869.98776,72731.08951,63996.60964,55362.91755,57269.32933,56547.84888,53597.85557,48064.55622,49334.29767,50049.25867,51662.21522,52924.72625,51294.02586,49515.86957,50875.04567,51338.15063,52240.86335,51743.64264,51204.11809,49373.90524,48424.34392,50405.64258,50619.11391,52232.05741,53564.15017,54932.60667,52124.76972,49341.73071,52819.13206,55088.47838,54791.149,53501.42511,53025.4713,52377.63975,49650.5934,46614.7617,47179.55309,47381.07365,47332.95731,47656.71868,47099.18961,46284.06454,46546.67265,47127.12699,47973.96323,48835.28681,49490.97019,50434.03206,48557.66672,46959.27774,49327.95608,51643.90508,50875.36174,50153.30804,50328.35357,50362.29216,51554.08016,52748.89762,50947.98604,48468.84108,48262.29441,47306.23054,46496.92782,46213.44657,47910.23708,50072.32654,49570.09995,48681.35423,49418.92887,50097.58521,50305.10027,50751.34033,49271.85018,48885.131721311],
    //     [69934.0361867115,66477.2205,63438.01619,66172.09754,69896.46218,71980.00676,75063.77606,65806.23783,55608.98965,51811.75157,48195.10967,47505.9033,46555.7464,48646.09046,51622.12047,48571.86908,45657.76035,49186.7426,52917.49576,50778.33657,48170.74337,48242.54646,48465.48856,50484.28936,52072.45556,49621.08995,47297.95368,49157.52218,50950.37403,48816.57726,48223.2195,48593.8858,50319.25412,50295.6496,50367.2705,52611.66662,53243.03179,52624.07494,53015.97145,49353.77964,43395.75724,46166.85721,49347.66948,49747.09162,48804.185,48354.52614,49744.06991,52025.75301,53556.19741,52450.91823,51413.13412,51688.67101,52029.43734,52415.56225,52829.48513,53913.86292,55176.25519,53259.43572,51198.14607,50921.73693,50591.47145,51397.24601,52310.43615,50000.71568,47629.42856,47340.95175,47262.22062,46895.64307,46851.3155,46677.85552,47065.1747,46114.17688,45205.54108,45685.32744,46466.92151,49854.52059,53625.78093,52274.92467,51112.600241836],
    //     [67975.5315656299,71016.12926,74076.04448,77602.93723,78017.93924,77115.55627,73088.84552,62484.04768,52024.49799,50559.84244,49250.51645,48752.81876,48361.9433,49693.53769,51068.13261,49247.48688,47868.25329,49964.51754,51821.59768,51154.42829,50270.6622,51491.89585,52834.6245,51494.85927,50181.95129,48566.49922,46998.24991,46906.08924,46743.36794,49275.19892,51278.20912,51244.00562,52393.67596,51381.14786,50626.28927,48084.48147,45977.39617,42049.36818,38559.9087,35410.01542,33031.37664,35862.23226,38855.26327,38402.48459,38149.06551,39947.09231,42104.04749,44230.51983,46515.98882,47876.93492,49091.91212,50567.39596,51883.15619,51435.51644,52623.59885,51621.14551,50372.51028,53062.36504,54085.89466,53236.21755,52167.90234,54153.37201,55995.52054,52083.22784,48002.01846,49616.72106,48292.32103,47189.31047,48889.71634,47831.56864,47576.95722,51864.7482,52496.65107,53383.42247,51544.66037,50461.47171,49370.69495,50855.07216,52206.9647342014],
    //     [71375.5442440014,71779.12764,72831.96031,74866.68256,76415.38469,71465.46814,66282.23158,57945.24559,50413.08771,50432.16125,52011.81238,49338.65857,47875.43001,49659.46733,51878.84748,51849.18501,52205.14646,54111.00089,53371.17122,53454.9318,51287.40608,55101.24988,57113.60121,54696.05928,50339.443,47924.14129,43847.56312,44915.5371,45314.51456,48330.52664,51350.08614,49865.72466,48383.6566,46150.09688,44988.42552,42911.28986,40954.33001,37839.34017,34551.54495,32978.21896,31630.61586,33288.25401,35057.73065,35603.22373,36165.95943,37720.00991,38631.09668,37540.84291,36866.44177,37282.90964,38160.98282,39512.08255,40214.4092,39757.84513,40118.87519,42970.01814,45656.78745,47167.73569,48536.97564,50222.19771,51880.9832,53668.38117,53784.66271,49305.14304,47716.70635,50710.599,53914.47312,51895.95564,51624.71835,48916.18765,49551.40615,49810.81616,51659.85586,50843.51157,50089.2794,50094.82024,50485.8127,51762.08742,54419.8677080786],
    //     [69964.0171019108,72849.18269,75546.62485,68482.29422,61864.79711,57757.53065,54367.74613,51638.94098,48179.48845,50378.08875,52310.81537,50375.63423,47897.92886,48052.21008,49319.33441,50325.85794,51258.82364,50511.54252,49609.63643,51119.09108,52335.37237,56054.85056,58557.95009,51656.20816,45598.66164,46482.99251,47701.46523,50331.51795,52847.76803,51663.80382,53488.91247,51470.05547,50321.74099,47079.38123,45068.78721,38920.97262,33937.97385,33331.92727,32160.57586,30624.90505,29937.16767,29846.82767,30105.61425,32796.07791,35721.70506,34566.21363,34911.43696,36113.91024,37815.98373,36398.82101,35235.97707,35374.67757,35494.67468,35747.5531,36009.28225,36513.54531,37131.95949,38483.13485,39665.54219,40012.26444,40375.3341,43037.45121,45003.71817,45506.70008,45584.80933,45697.96746,46225.8046,46723.86478,47414.47661,48030.77351,48665.98332,51059.94205,53360.43205,52970.03184,52564.67647,51304.10853,50172.16707,51596.5804,53391.1947794943],
    //     [77260.050657705,78157.65628,79152.50559,76600.64139,70392.25375,66049.3848,60899.20648,53952.32874,47173.32005,47890.64607,48602.71853,44557.05796,40700.3884,44076.78524,47705.62029,49814.87111,51766.84349,55107.82814,58372.13942,55246.47352,51987.06552,52505.25473,52710.33641,48480.34162,43982.58151,47582.33436,51429.03579,55954.11478,58702.98538,56057.17356,52076.47077,49341.86832,47082.65733,41692.61491,36246.02411,36474.66176,35709.86234,35220.98435,33793.32937,29445.7321,24678.31346,27692.13146,30468.37094,31283.01463,31875.98937,33502.67944,34993.93615,35195.42917,35462.5033,33508.22869,31881.35759,32940.22193,34648.54271,35360.87649,34681.27529,34100.72981,34748.86074,34983.3953,35434.4062,35474.84305,35697.48128,35813.65934,36260.89662,34868.81163,33916.20214,35439.46983,37415.11514,36930.08929,37469.38049,38775.58753,39725.08768,41558.79547,43418.91144,46085.06691,48494.66283,49292.06307,48964.22043,49847.47184,51413.8146391421],
    //     [80158.620921572,77151.3086,74229.98295,75951.87573,77563.4984,74576.26546,70900.57368,62367.89514,53638.8413,51844.21267,48288.03356,49775.01478,49819.00457,50647.09204,51425.30915,49029.24781,46569.91526,50160.08866,53884.77823,53050.98454,51221.34654,48560.9201,45456.21674,47372.47253,51850.78798,55165.4411,53865.42882,52529.06527,50787.06186,52040.91952,53231.03545,48715.21776,44244.21063,38270.33023,31097.72998,33286.08765,36146.71505,33861.983,31605.59889,27335.71052,23349.80212,26536.40616,30015.49839,29763.83765,29482.99825,32522.113,34535.27331,33578.0061,33173.91096,33122.03389,33214.71831,33927.37783,32761.19858,32808.41374,32621.69574,32996.83774,33489.61527,33846.83467,34119.99426,34913.83785,35822.39618,34062.8791,32414.69856,33724.19524,35320.88317,34786.08923,34886.74473,35058.57971,34432.1926,33472.8675,32810.08957,35098.77847,38652.30561,38794.16894,39143.96855,38201.54795,37592.66039,37827.03983,41101.168925424],
    //     [79558.2387954829,79733.67863,77561.61802,76705.43381,76055.22374,74985.99346,74157.22542,61154.28082,45338.84073,46095.8834,47673.15628,50541.59884,53825.78193,51968.68282,49974.16053,48613.40346,47308.17363,48189.49201,49223.17536,49525.9617,49657.69407,48770.0759,48493.17916,58393.1483,65774.22976,58929.63646,52197.78117,50665.37401,48630.14787,47564.63465,47054.11642,39728.76992,32850.89069,34765.78791,36534.81268,34773.9368,33282.02879,32099.1432,32274.83842,31698.82585,29949.23827,32335.28968,34474.16286,35000.17989,35107.73897,36513.42747,38939.6621,40319.1649,41317.49192,39737.42336,38543.12287,37071.99555,35554.39637,35651.77232,35725.43564,34189.53923,31749.44859,33324.65124,34626.9658,32882.66816,30937.95021,32603.89417,33865.26975,33707.20048,33562.25844,34192.92722,34592.77478,36199.38182,37485.26911,37078.45176,36306.49615,37733.92763,39116.79272,37906.85839,36654.2391,35978.49296,35390.89118,36445.01852,37407.9923473646],
    //     [76127.8721517941,79552.99597,82808.28335,79463.96237,77249.03917,74882.97135,73242.55065,50930.58265,28821.90405,40550.65238,52459.68743,59459.60117,66392.21308,59539.57742,52795.29524,49633.39413,49506.48869,45144.89487,40802.14654,43186.03499,45590.30971,47372.87031,49185.83547,51952.28086,55205.92974,51174.59297,47413.40017,46470.29672,45225.41676,41991.50173,38717.60025,36106.9773,33012.69378,34529.14139,35943.26568,34702.66273,33546.6469,32322.48379,31569.35557,32486.13695,32692.12294,36861.43943,42028.28558,45845.4036,49319.94535,49015.39112,48079.95699,47708.16169,45976.36974,45839.72826,44985.20069,43289.81663,41539.1448,40754.08909,42011.76835,37138.26392,32278.36355,33438.98571,35239.02449,34093.63785,33133.26396,32365.50765,32147.24909,31326.90164,30443.00201,30526.51552,30784.35849,30802.94341,31410.1863,32788.57835,34140.74791,33471.29828,31976.0287,34061.01928,36114.12427,36343.16594,36571.33776,36783.09125,36497.4060790198],
    //     [80385.2877677352,83619.55566,87037.74812,80989.78471,74948.41401,75911.55222,76877.35654,54486.63291,32233.92958,42319.44972,51517.07341,54323.85565,61204.89612,68162.60792,74581.84157,60997.0343,49578.4329,46762.09517,45966.06209,45467.22304,45566.58182,49652.55658,52831.18463,52719.35739,52029.33522,49185.18603,45652.90351,42842.68057,40095.63197,39230.63946,38402.18343,37387.38837,36445.66822,36298.99374,35370.69644,34917.96055,33861.66862,35051.8557,36067.13665,37978.50934,40030.40507,41788.15903,44410.11759,48738.47126,51816.35336,53581.75955,53583.46947,47008.48647,40814.73251,45400.77182,49817.23841,46565.39389,41395.53383,44264.88891,46954.62427,42500.35251,38397.13017,41234.12332,43753.39285,40983.24591,39001.58785,38824.07664,39246.94119,39495.03586,39967.45264,38902.97625,39280.52137,36690.56727,33521.5577,35264.03846,36084.37551,35178.21381,33846.14282,33627.27837,33803.58719,33544.78591,33489.12754,31488.88818,30049.016096009],
    //     [81511.497834235,84389.00575,84376.55197,79523.06125,74946.30824,74582.48385,74064.18409,60220.57117,50607.34088,50845.90756,50717.32745,50899.56394,52161.00945,56000.19435,60888.72635,55038.43456,49970.82236,51591.90233,53054.68839,47769.31841,43272.69985,49162.16468,55304.4574,52290.93837,49310.46981,47454.65348,44800.85784,40902.06275,36753.08263,37176.05666,37210.66599,38163.54769,38202.33031,36679.58506,34053.40033,33081.31976,33348.61324,35100.89875,38239.86579,44239.85861,49345.81595,45161.32606,41800.71429,47514.4223,52791.24096,52311.89906,52376.41614,46315.22123,40282.72602,44350.113,48354.48487,43722.02319,39190.46211,40416.20567,41753.10311,44118.94733,47852.34283,50739.55257,51863.81089,51292.40263,49067.02252,49753.7041,49662.35692,48956.59172,48351.97322,49369.30973,50068.81239,48564.17198,46727.6529,45562.30433,44160.10157,43551.81015,42892.03004,41921.31893,41023.6082,40489.62636,39890.95206,38693.41663,37463.583868986],
    //     [77529.5712266149,80654.09684,83938.31474,77923.9393,72418.55058,71862.06192,72986.4745,64378.63539,55785.91513,53648.58876,51544.77767,48993.54627,46523.28666,48607.60103,50707.81667,49749.79873,49571.94523,54301.49367,58980.66543,51401.6999,43746.58557,49943.27325,56139.16453,54072.9321,51843.98659,47329.7512,42806.10899,40543.69696,38095.7679,35525.8327,32842.85303,33099.81859,33500.68061,32739.13323,32514.98207,35445.46479,38594.05862,38405.02172,38417.93688,48473.25588,59862.19103,55915.08427,49189.91638,51448.40041,53219.26173,51247.77763,49412.36225,46341.98527,43224.43257,41494.90305,40062.3991,40043.38453,40585.31161,41122.24868,41703.20017,46177.31601,48065.30552,47861.94053,47298.0177,51014.25904,54638.172,54143.2265,53311.66603,51101.46867,49348.54753,51779.39731,54771.7905,53926.5727,52560.42144,51720.14751,51211.81055,50439.63158,50472.00838,49710.6395,47639.63465,49841.25914,49629.79217,47571.20834,45748.4034288172],
    //     [72420.8606236067,79480.71838,86432.82969,79346.9626,72186.02,76115.836,79755.60537,70596.01524,61330.52193,58527.03114,54409.9294,51666.23838,49068.17688,49882.0578,50867.42505,52610.69988,52441.59535,57216.16813,56078.88205,49465.03795,40980.97643,46121.71436,51725.2879,49373.80296,47764.74104,41449.49521,34464.29454,35638.60907,36940.41643,35238.97026,33579.7063,31408.07992,29312.30603,32172.52921,34814.14564,39347.90926,45936.37219,41857.27505,38006.36028,47852.77882,57664.70587,56609.27163,55353.07355,55326.90052,54505.55108,52605.13004,48588.47382,43403.49569,39782.53183,39176.16455,39285.50293,40118.82542,41932.67161,40221.61379,37991.08418,38497.03588,38890.11922,40512.53205,42077.95735,43852.28011,46311.72317,44855.23415,44989.36861,48276.65951,48419.35922,48983.5361,49083.319,51338.56293,53014.71346,51001.70316,51018.86946,49523.98314,51174.08707,44712.60513,38242.98505,47876.35664,57868.15581,57382.24052,54535.6423276325],
    //     [64526.3738358216,73232.18013,81672.75521,78951.78775,76055.71785,74582.66812,73065.62619,66515.82473,59425.49967,58484.656,56977.77117,56182.06307,54484.85145,51385.66082,51302.15084,49428.96954,47784.56827,51693.34332,54983.43278,46397.47225,38695.11528,44860.32947,51154.3724,48786.38317,46796.46653,39937.78825,33335.4177,34511.2961,36271.68306,34563.45293,32455.09031,29734.40827,27621.87204,30850.87951,35486.50545,42610.79314,51680.78495,52097.2544,50069.59306,49666.9275,52254.53756,54685.50717,56327.16831,55419.9975,53769.05742,48729.03686,43617.77149,41958.24714,40320.56497,39327.99217,38521.23372,37387.35257,36142.10427,36614.03467,36923.79606,35499.41012,33805.48228,33569.1735,33399.63825,34221.96595,35355.60934,36779.92089,38608.9827,39299.37816,40015.92872,40427.30423,40872.59698,41238.89966,41636.03403,44594.2616,47623.96192,43667.46242,39928.10064,39339.85357,38654.88409,45750.67098,52833.18923,51745.3568,50654.9920549328],
    //     [63166.101536198,67696.13628,71990.70733,70588.50053,68638.56662,72618.07087,76527.71804,70754.25688,64951.66399,58045.28377,51252.64024,51632.77347,52186.69985,52262.86452,52347.19903,49280.41329,46452.29898,51834.02442,57019.94609,49300.65719,41569.77532,45501.11973,50544.53606,48859.9351,47249.801,40417.65312,33560.07259,34528.16912,35801.04843,35867.88919,35951.46356,32998.29623,30071.33514,33767.13649,37767.84826,43963.67568,50656.44227,53785.55296,57225.3011,57933.11431,59065.95373,55668.88083,54290.83247,51005.63684,47454.18157,46278.97152,44560.46266,43216.99501,41494.65774,39287.86341,36933.91738,34984.8096,33043.90001,32119.27228,31882.2698,31772.62574,31026.26356,31325.40443,31621.91826,31506.75285,31407.48856,32814.48373,34546.85153,34298.03621,34510.45384,33842.21797,34868.65984,35347.36091,35920.79054,38079.30063,39451.20696,40353.48269,39741.15177,37092.19668,36531.73868,40476.96805,46519.32123,45491.09557,44589.221810435],
    //     [60674.4705599054,65880.89103,71033.12907,72392.73844,73706.10806,79164.7576,84530.73781,75698.54262,66805.6889,60766.24952,53746.78325,54692.35885,54790.40639,53898.42496,53362.23588,49396.2153,47072.92972,47471.28993,50290.7974,46542.46761,42131.51623,46322.83045,51306.6248,51612.97218,54194.41083,44765.6919,33968.74149,34955.36187,36062.71131,35113.89673,34166.27109,33338.66461,32438.82438,39126.37693,45045.29372,48833.80446,52047.1255,55450.35107,58853.84975,56587.17389,54321.54776,50852.85545,48329.07887,45599.28715,41875.35909,43330.77626,43559.13168,39347.51582,35881.72851,35595.78622,35016.56435,34172.77579,32791.33482,33951.13726,34679.35175,32750.23351,31243.74017,31470.34569,31848.86335,31252.08755,30905.74913,32257.02857,34015.45999,34648.42084,34268.66785,32686.08537,30209.50069,30672.77359,31336.01951,31389.28823,31268.07385,32835.79726,35561.46908,34700.67587,34074.97613,35490.61422,37007.62917,36846.97439,36505.1611506868],
    //     [56560.2123452492,62916.68243,67528.82346,68005.88947,68631.89017,72786.91374,77029.74864,72107.33942,68412.16519,64683.71436,61059.67851,58044.23233,55445.40867,54281.39489,51950.92033,49768.61086,47074.9564,48612.02027,49857.55728,45893.98844,42028.74618,46798.97307,51103.70695,51348.46261,52400.16108,42504.37435,32989.92384,31754.30445,31790.22173,32945.8104,32687.93427,34166.92022,35037.14508,42852.75798,50259.51881,52823.74968,54593.00212,54270.24413,53737.96926,52059.40659,51085.65024,47377.8786,43010.81936,42386.818,42020.34728,41527.49097,41696.27971,36957.99308,32986.27994,31645.7493,30709.29536,31554.88933,32380.69069,33151.72538,33828.15222,33724.97804,33563.63422,32921.88384,32230.64121,34343.9722,35502.50333,37039.61261,37629.58522,36688.85357,35702.03649,34423.00659,33152.96009,31517.61284,29971.15079,29862.47675,29884.6221,32427.51504,35009.14547,33024.77458,31120.08149,32492.34829,33834.49813,33174.70219,32484.4245222196],
    //     [59459.6919838833,59106.50979,58492.65874,64281.16775,71642.99249,75805.6799,81642.88253,77455.3247,72937.16584,68554.43054,64118.41408,60266.8503,56680.35663,53146.84505,50090.16452,50533.31936,49597.37989,50556.04853,51239.73998,48331.75776,44993.86336,48232.01924,50703.72905,50064.87971,49425.62722,41434.56547,33442.88758,34191.5811,34783.03489,33803.78705,32546.10539,31996.59195,31555.5569,40673.45593,48782.9291,51292.70628,53104.41786,55155.28229,56804.15967,50713.90402,44442.32073,45819.24622,44045.80536,42588.98195,40733.57821,38746.71036,36992.72108,34444.96346,32105.71422,33413.48817,34548.82447,35014.0772,35510.99724,36540.58814,36357.52413,35954.035,35245.35724,35574.01676,35225.51466,36622.10135,37139.53546,38333.62175,39267.82106,36907.27783,34634.60959,33435.5487,33844.8754,35704.90024,36998.86062,36560.2634,35895.96497,35571.86279,35290.02043,35640.23698,37117.3458,35173.01123,33405.08393,35113.07684,36640.4788718476],
    //     [64709.1228847248,67279.95514,69892.38993,73336.38425,76869.26165,76687.57096,76509.41685,74719.9746,72929.95153,67986.84057,62031.33916,64675.51217,65655.12024,58286.10881,50697.35527,49890.3678,47910.45311,47533.71637,47686.19109,44955.85543,42895.2927,44770.69941,47597.26378,47058.01831,47365.71702,39581.0389,32330.17942,32037.1787,32214.47454,32239.50979,32394.53789,32446.11182,32359.40694,33930.99318,36343.71736,43769.62067,51792.18141,50075.4106,48360.39672,45882.58399,43420.16295,42290.8878,41333.98779,41507.48049,40976.32097,38571.87101,35212.20914,33201.705,32057.61808,32624.06812,33443.8612,33260.09219,35269.6787,37380.07581,37085.17929,36738.73364,36773.21021,38100.01559,39864.34004,39514.32591,38339.05843,37658.27042,36333.3646,37103.28782,37720.14753,37591.08349,35225.86084,34370.26464,34709.88403,34423.14651,35749.2299,35983.14759,38591.62682,39098.26015,39511.27038,38643.80424,37696.30354,36338.88599,33896.3568995831],
    //     [61146.5886158506,70084.69915,76974.34872,79446.33262,81917.49054,79095.44601,76277.01079,73091.60349,71691.3396,68260.4094,64942.24488,62247.23208,59403.60442,56189.26894,52510.43124,50819.11579,48107.53557,48408.5383,48462.99007,46464.02142,44236.8301,48188.58531,52301.28299,48968.29049,43419.22193,38099.28663,33506.8425,34653.43306,35412.19709,34381.16491,33379.32774,33337.52854,34145.09308,39655.18143,46469.50713,49429.9496,50056.94786,49612.87776,47174.55533,45016.34297,42588.25728,41488.81854,40315.94689,37583.35499,34532.3093,32898.15737,32603.26096,33142.84352,33861.06486,34617.46475,34667.08506,34314.78809,34238.02906,35720.59644,37022.13979,38127.53328,39270.74415,41543.93318,43030.39164,39742.91024,36664.67561,36420.15884,38307.31673,37120.67728,36022.7842,38273.32152,40522.23855,38635.96351,36747.74584,38296.97592,39838.22615,37332.68571,34812.64306,35328.57214,36066.30986,35649.75679,35288.71555,37446.80679,39794.6139179886],
    //     [56850.3153483828,68010.31702,78524.02948,80174.59463,82846.65203,78096.5881,74675.56532,71687.92314,69185.37447,70493.94541,72099.58228,67098.66847,61762.24768,57322.1273,53204.94542,50559.67221,46651.88771,47679.20255,48369.80758,48785.86513,49295.78814,49789.09399,50685.59669,47566.22395,44494.1622,39036.39646,33630.53332,34238.58851,35238.20982,33780.93228,33679.38332,35020.58819,36328.97492,44086.08008,51856.50808,47974.76788,44024.52734,43462.74271,42916.21821,43450.35835,44120.51132,39237.1162,36292.62529,33591.93558,31648.77868,32105.79452,32622.54672,34294.57737,36108.13612,36856.30131,37577.39555,35635.6226,33610.3653,34044.91795,34061.1284,33915.2974,35124.30074,36266.69403,38277.18085,37461.59218,36863.55004,36450.45216,36442.55759,37542.63277,39190.10074,39849.30236,39994.8502,39633.94575,38977.28146,38441.78073,37616.69337,36980.14686,36694.01412,35080.96213,34837.5903,34174.96327,35295.43899,35995.07331,36579.1288683525],
    //     [57404.7598945134,65188.33383,72896.01286,75793.31337,79351.01286,77202.18297,75395.52206,75975.02934,76765.39797,73018.36185,71920.58123,69212.87591,66303.67251,60221.24298,54042.26131,52087.55777,49339.78047,47179.68392,45497.30931,45507.14164,46511.20155,52059.65995,56535.10246,50589.88964,41362.04984,36427.05549,34369.39105,36004.37441,37679.35129,34138.77144,30647.76455,35366.06297,39881.82587,47151.64298,54188.08723,48727.46067,42762.83533,44371.17042,45835.92806,43173.80641,40512.43315,36155.52194,31462.40751,30399.73428,29547.65891,30841.50633,32594.4187,32968.59952,34936.97422,34299.16462,35380.17282,36275.00591,36914.48393,35931.46394,34816.68042,33469.85441,32492.5352,32903.28877,33251.11511,35150.81392,36869.62128,36802.37643,36378.08886,35212.40596,33332.16891,34620.14205,36612.02438,37109.48401,37648.14776,37187.97467,38096.29204,37866.60173,38007.249,37471.11209,36895.23955,37360.15759,37864.71715,38811.88452,40107.8548563725],
    //     [65282.9357859239,67879.19829,75289.25736,78418.19396,81524.04322,79855.5207,78186.06653,72796.8615,71725.60569,74601.51957,76373.28904,72058.45865,68022.34038,60455.39163,55340.38795,54454.95865,54109.11749,52855.86664,51074.49251,49759.00406,48644.21037,51862.68499,54669.71733,53513.64422,55360.78781,47011.55876,39996.62252,38383.57633,37235.52104,33122.31626,30255.79347,37145.30374,43092.13011,47845.53914,52584.21081,44070.59639,35328.69684,38305.37118,40275.46196,38838.0822,37020.13657,34021.02075,30904.88321,31176.55896,30880.01298,32185.7043,34418.58739,35097.2242,36148.69154,34592.3152,33765.06636,35124.51399,36451.74563,36719.13662,36845.02374,35738.35564,34550.04394,34262.76415,33686.76642,33457.07556,32302.52376,33371.08902,33019.19674,32127.2156,31235.68876,32557.40776,33882.38572,33539.19732,33153.05807,33899.01641,34624.96008,34630.95344,34724.92048,34483.5183,34137.82407,35059.42581,35939.88936,36681.7259,37348.3101231254],
    //     [71399.9400091528,76058.09928,81190.93995,79844.84383,78528.04329,81383.80157,83653.54318,75661.42589,68022.4232,73605.06503,79486.87585,77396.06673,75036.46318,64855.10331,53647.11842,52289.64135,53040.95804,50014.26905,47190.857,49602.19673,51822.38943,52630.35305,52776.12793,54097.23042,55298.63217,50275.05866,45046.05968,40610.34885,36480.15744,34786.47636,35138.10506,37037.44138,38628.79565,41364.90096,44304.82153,38189.86611,32105.98905,34553.53343,36862.2017,35593.68988,32380.91897,31205.83321,28935.59982,33020.04243,36120.42379,34359.40353,32571.81618,34618.48979,36682.59919,36798.26061,36910.05859,35207.75714,33512.0554,31228.30164,29380.7449,30395.97364,33190.76592,33347.16732,33838.57877,33726.30123,33268.91829,33553.68088,33554.49507,32763.60461,32024.54262,32510.11399,33174.84455,31832.51719,31079.32297,32769.04752,35004.35499,34220.37523,32830.85669,32130.97668,31342.36898,29728.52888,29706.25207,29848.52336,30114.5936148061],
    //     [75354.1349866847,78472.49012,81319.42976,78981.30606,76422.21565,77952.17123,79481.19425,73026.9771,66745.18021,74152.86759,85432.73713,81106.85335,77007.39048,66855.09633,58357.43558,56153.11896,54341.52828,48582.27344,43828.49395,45762.78158,49713.36843,48815.42305,49008.42943,48920.53144,49131.483,47094.54244,44933.73869,44224.78597,43089.56784,36846.75021,30431.12136,32257.33371,35245.23962,43615.75699,50564.35722,42205.84431,32979.25428,32838.58948,33112.59654,31161.5545,29513.40782,30649.42346,31389.50476,33032.889,34653.45335,34977.87823,35543.29493,36225.65931,36648.85699,35960.44354,35837.54784,33113.7396,30749.35862,28382.46119,25607.55904,28579.10017,32210.3138,32467.2104,33195.84932,35174.04673,36605.6552,36111.62987,34705.73758,34719.11001,35339.58769,35638.26559,35255.41365,34601.3274,33820.42201,35543.05197,35796.03464,35625.71999,32528.66437,33043.8992,33639.21108,34457.14406,35292.75903,34582.98481,34347.0603742859],
    //     [69848.9303160158,75799.03216,80255.72645,80970.68352,81525.36235,78038.33583,74732.43843,67750.63449,59631.51966,68369.13686,78474.90217,75865.51229,71870.0846,66231.19824,62533.40653,61319.58758,59370.25359,51508.36832,42617.98749,47437.69445,52319.32863,50624.98601,48942.97173,50026.48911,50156.43051,47727.41585,44943.62283,42406.92215,38677.90172,34303.56085,30717.57464,27702.2899,24864.18615,40899.40717,56213.66711,46667.38552,37393.91501,35757.28389,35727.96235,33307.1696,30134.00083,30498.4372,31095.79951,32607.94628,34257.97735,34126.73566,35171.31697,36684.29124,38541.61965,37091.20081,35796.84083,33875.98999,31600.7763,31059.45501,30349.43068,32173.00985,33805.05472,35256.1086,37477.38488,37646.48288,37894.22323,36538.81811,35223.67135,35546.86064,35940.91328,36040.56208,36245.92942,36104.72008,35962.19529,36756.33466,37612.14491,36529.91572,35587.47551,35060.88484,34477.92029,35419.07473,36495.35088,35860.78666,35323.2705310011],
    //     [68988.3639001357,74503.37105,80391.30238,86145.68178,87575.76777,80788.7144,70494.54889,69443.79836,68170.39882,73826.12411,78746.03883,77373.95546,75555.13024,70808.91343,66000.73912,62886.09186,58750.44307,52924.89297,46720.597,48717.28212,50757.90852,50504.68732,49577.72371,49274.51803,49115.57984,45704.95076,42208.13775,38625.1711,35212.6279,33014.64758,30345.52134,30055.04306,29628.78187,41701.26547,53494.83552,47390.38736,41275.93612,39544.03061,37798.52739,35448.22587,31642.38284,31727.11608,32446.42132,34557.54366,35855.78454,36183.99962,36531.59264,36807.03552,37101.46266,35601.02109,34105.07472,32222.52989,30319.28187,31087.37687,32041.68028,32320.91823,32924.42773,36912.92273,40850.86283,41933.02054,42910.91181,40961.08717,38928.05966,39422.49675,39620.09964,38622.8326,36658.10329,36507.13309,36361.93191,37399.23355,38179.5397,38537.05103,37418.24479,37369.89225,36232.78771,36003.07795,36070.95629,37100.75496,37982.9868312827],
    //     [69936.9159910157,77794.96466,84778.51372,84340.89766,83738.37681,77820.72159,71964.72571,70982.89733,69346.04474,75476.20735,78736.33259,77600.60092,75207.34283,71526.16571,67700.64015,63123.87838,58504.90547,52857.52231,47692.51676,48395.25464,49168.21406,48171.73399,47114.98966,47294.08046,47079.27259,45389.53588,43712.93611,39447.74217,35247.50873,33917.02731,32769.36842,40208.70892,47445.62633,49673.48987,52385.30068,46537.5906,40940.96432,36614.48892,32100.26521,32318.03447,32499.01354,32075.74611,30808.00139,32601.24771,34710.99547,35095.06671,34883.18447,35235.00507,36106.3224,33077.35567,30453.35701,28273.12624,28564.02459,32500.24541,34059.40963,34416.73497,35763.65362,37690.29033,39952.69012,40240.34649,40882.76311,40279.93748,40045.47765,40345.59944,39616.7041,40655.40164,39988.00688,37623.65158,37119.26658,40272.12647,43441.92007,43352.52086,40569.1087,40046.68977,39529.57138,39557.18582,39576.57935,40427.04624,40315.8133662324],
    //     [70760.4257538413,69647.2749,71166.97752,76125.90079,81361.07583,75478.40544,NaN,NaN,NaN,NaN,NaN,71741.59144,70647.11779,70194.69887,71105.20072,65749.30239,59483.24216,53301.3917,46861.84977,49728.42953,52512.58809,49404.47508,46221.65072,45526.61321,48522.01718,46181.73048,43370.74081,36905.56298,31759.44503,31752.9983,32142.89127,39484.40743,47348.92858,48165.61962,50129.54871,45038.92642,40414.11115,35300.57497,29653.33986,29447.54409,29437.76448,30643.09984,31788.2388,34541.08847,37298.47571,35052.54763,32939.33197,34276.77071,35526.6377,34515.15735,33488.53615,31581.87067,29308.01994,33084.10256,36794.83085,39235.62699,41665.65203,40986.13157,38502.377,39110.46316,39161.25644,39202.43021,41945.04591,41014.42722,39844.72885,41249.82149,42615.12339,40909.48291,39046.98843,39664.53911,40094.22918,39489.29285,38979.42076,39534.40048,39484.26308,40430.18964,41619.96637,42008.06074,42683.1202611933],
    //     [77026.7944559386,79896.0209,84089.73218,80380.41497,75777.61655,72307.03798,68255.87169,55923.16508,45803.37149,52114.66084,61146.87221,68060.44663,75503.95255,71504.73091,66692.23616,62641.68065,58421.11799,52840.73081,47025.38202,47805.9321,49140.63147,44407.20333,40993.56279,44599.3498,47452.14399,45276.91708,42907.97347,39302.40037,35823.1884,34542.05584,32387.03256,40825.61664,49218.59526,48598.95876,47841.03706,43534.2442,39247.68433,35905.08949,32569.61422,33215.74872,33358.33808,32431.49514,32658.09754,32821.87024,32842.59588,32945.79747,33098.12515,33308.59247,33376.80126,36224.74762,38994.12609,35378.03002,31677.33674,35312.53674,38241.20649,38800.76598,39235.0034,36407.61329,33636.77292,37605.14942,41116.80073,42272.02168,43340.32827,41287.07674,39408.96905,38452.16664,39111.25708,39272.88057,39252.59831,38530.09185,37877.55949,39766.30927,40311.42287,39068.46499,37182.69366,37515.14947,40238.34347,41481.05979,42627.7976355383],
    //     [82037.8204241552,81739.00525,81026.30921,79633.76383,78179.53673,76070.99592,73988.84423,70796.19051,67006.41417,67348.52574,66664.7122,73414.12654,78758.57931,76422.93513,74459.19098,64785.7094,54210.42736,50199.44174,46418.01787,47291.28983,50470.08798,46814.94684,44448.22974,43023.42539,41847.803,41991.8911,41065.41508,35995.63651,30953.87269,31890.03361,33067.16583,41467.94401,49636.88843,50045.62248,50425.97912,44527.12905,38133.41201,33847.43586,29853.00366,33212.39257,37020.0434,35393.41983,33588.01259,32498.61168,30900.969,31914.89234,32986.82198,34579.53388,37553.39588,36807.19492,38791.13749,37352.55092,37304.33854,37811.66638,37849.02521,38941.22654,39968.10702,37862.57622,35163.35277,37382.76254,39618.77421,41083.93374,42642.11033,43193.7347,42533.73823,42141.29378,41007.68193,40978.59929,41094.2823,40804.06328,39562.20929,39172.8,39013.12421,39091.86197,39233.22791,39866.99394,40594.88128,44224.48291,44881.849573179],
    //     [77239.8078754247,79523.47289,80640.37483,79231.30501,77580.50964,78225.21643,78292.72408,75799.46444,71881.88506,72999.18864,72844.72566,74612.80408,75242.12385,81699.51669,82574.20306,74107.21749,62910.94105,56415.92758,49349.86942,48049.05504,46756.22161,46426.41784,46103.49209,42792.31262,39851.65539,39635.62667,39371.73093,35488.13111,32435.45096,32687.52782,33320.82734,42233.28049,51003.12337,50877.59689,49262.85021,44538.3303,38690.51076,34660.11642,30508.77177,33832.78886,36689.87017,35538.44099,34387.97747,35854.39043,37445.6948,36286.18373,32241.47092,36593.22492,40918.07048,39257.95601,37577.84307,38430.32536,39117.88663,38125.94546,37184.86652,36733.06646,36332.61354,36330.37941,36503.49581,37726.48848,38670.26225,39717.05696,42324.9363,43117.32691,43745.62507,42799.12441,41803.81465,41352.80825,40844.16479,40104.30031,39236.41525,42093.56186,45414.06745,43706.7639,41360.30647,39637.78494,38395.89582,40538.68521,42875.5307352755],
    //     [79283.2341697583,77697.20377,76554.55793,76696.05021,76527.13523,79248.88709,81541.55344,80919.36378,80297.40322,69925.79421,60476.58837,68555.58455,77693.39184,76815.37761,75223.744,69284.70093,63914.12223,55556.33459,46782.82126,49688.94219,52390.98769,49562.47225,46298.52914,43660.44046,41265.81769,41551.33693,41890.98299,35686.48054,29504.43015,31167.88367,32558.57168,41043.35313,49552.66317,49143.31555,48702.70502,42120.05598,35607.14459,34624.52329,33684.09869,35391.87283,37063.42436,35726.36269,33706.14383,34196.86921,34807.84361,35761.98888,36596.21086,38797.20117,40834.18006,39706.67163,38584.69909,38155.98158,37860.96729,38801.39517,38649.21748,36689.78995,36707.60094,36459.11526,36223.5214,37832.96107,39505.1952,40998.16293,42600.63866,43885.91167,45243.28873,45053.48509,44681.63063,41249.05338,38358.68146,37738.72617,37200.1552,40893.21701,43137.31374,43478.32938,43957.87735,41688.01332,40685.51483,43047.80603,45418.9460629951],
    //     [73950.9956431381,73999.76896,74548.24191,78064.57514,81152.91846,79760.18427,78011.20992,82998.54248,86853.1411,77313.38418,68012.09063,71796.02626,77784.64912,77585.45001,77601.61876,71726.91772,65569.82423,58194.40166,48948.66217,50515.07334,51415.6308,49553.91178,47356.5284,45464.80655,43347.833,39807.15189,35738.45523,32057.10065,28395.6035,32340.77941,36284.5871,42900.21945,49681.92331,48034.08031,46332.44603,41248.50526,36170.29705,32984.61289,30187.87554,34896.07913,40272.32371,36460.69424,31582.39034,33191.69583,35057.70661,36688.56807,39025.53806,37397.7877,34768.70101,36561.49369,39455.74556,39039.10785,39436.45609,38346.13794,37800.3573,36836.21167,34616.27921,36457.85406,36963.88251,38679.16042,40458.47153,45062.80312,49422.21479,46411.68106,44549.36211,46448.37242,48360.6192,47632.07202,43576.50853,42025.12668,38465.82654,41006.39404,44178.63298,44556.24485,44949.70185,43707.31443,42605.73783,45884.85732,48442.3973137439],
    //     [80771.1815483013,78285.26875,75361.74073,78405.07161,81201.77951,77052.60675,73228.76519,77223.93522,82495.39704,79504.81359,74983.17436,76257.23016,77450.78645,71051.13267,64822.24662,63762.8993,63464.67056,56960.90776,51332.13657,51656.40623,52213.49699,50204.90892,48458.55899,44405.78663,38499.3106,34360.45302,33208.30238,31319.01458,30358.59758,33928.80889,36820.83439,42999.913,49429.61911,45805.50832,44874.77468,38596.27029,33198.57689,33668.33289,33321.63857,36560.31715,39621.16477,37470.25909,35302.03874,36505.4694,37581.73063,39418.36283,41103.05906,39141.06162,37004.07363,38153.32601,39208.38974,38247.70143,37550.28643,39252.49373,41073.23722,33618.67014,26423.76275,32422.19591,38579.01157,38719.87583,37922.73837,40891.85596,42551.01486,41169.24269,39911.46984,42720.25009,45950.57131,46463.27962,46217.50811,44505.00879,42784.75914,43939.9126,45822.759,45111.2998,43527.08952,43058.14149,43232.9838,45034.74704,47567.3792164406],
    //     [76960.0389413515,75026.24474,72556.05748,77356.05724,83081.72668,78012.77191,74473.83905,80455.83916,85688.61359,81282.65616,76577.8001,78812.9868,80549.84404,78969.49708,78052.27804,70932.09348,63116.62665,57382.48991,52103.03023,54186.93802,57401.44927,51811.89831,48429.61874,43728.88063,38140.06438,36555.36741,34790.93737,32504.41677,30212.58771,34703.80825,39161.99077,46090.88719,53016.98748,48008.69225,43006.42457,37783.78124,32478.49459,33686.83474,34746.51852,36995.65602,40036.25904,37854.17999,35062.00339,37775.96725,39114.1628,38596.92542,38144.28148,37950.77712,37709.21484,38717.75114,39844.18585,39571.29133,39368.2177,42695.94464,45379.43797,39915.47016,36720.07386,39120.8028,41415.93756,38174.75774,34313.57737,34960.42092,35605.52526,34924.71963,34237.35685,35280.8192,35889.95486,39965.16353,44011.22172,41392.58174,38511.6062,38943.24924,38366.00104,42683.29205,46971.73411,45205.22507,43859.17057,44312.30683,44782.1738777244],
    //     [75122.2316064127,74027.24403,72757.97542,78261.62181,83340.2916,74967.4068,67842.97679,75197.09668,83995.57408,78299.25685,71657.21109,73053.99984,74134.7281,76157.78018,77346.69184,71039.85234,64049.05134,58091.34781,51920.12822,54282.0711,55897.10631,52521.70465,48857.63067,41976.81082,35810.42129,36661.06534,37838.332,33753.47845,29714.17022,35670.65498,41712.83889,46400.45119,51750.58156,47431.20474,43296.18737,37248.58106,31171.64857,33412.30366,35774.18887,38158.1187,40686.73015,38293.79641,34535.18807,36498.90761,38638.46493,37698.60704,36555.85152,38405.578,39607.12974,43007.17859,44460.61281,44911.94285,43811.33286,43562.49526,45537.89631,43808.15557,41017.67269,42318.13663,43262.10595,36869.21577,30530.87468,31194.00965,31763.46728,31331.06746,31696.60294,33437.25128,33453.61671,35154.61309,37650.86534,35412.31981,32828.70453,34387.39799,36589.29681,37823.59303,38988.18018,38553.74506,38373.68791,40950.6505,41324.1807132377],
    //     [73743.4590373433,73457.86125,72051.90164,78215.19806,83862.71859,78910.85019,74334.77636,73768.46185,72615.70507,68760.87812,63162.55407,67671.29221,68359.29164,70919.26383,67949.22948,66267.78611,61466.06841,58155.25197,54789.17211,53008.65609,51246.5321,48529.65692,45855.58283,40988.97274,38791.07344,40000.72213,39537.90106,34037.28158,28877.54041,35598.73745,42771.78293,45151.00984,49552.4305,45419.18959,44397.0759,37243.19513,31568.31824,31603.49979,32836.03771,36735.72963,40296.71936,38375.45882,36477.75576,36891.91587,37298.11054,37241.13125,39112.25221,39295.74435,39554.98895,42952.88039,46268.59986,43250.98279,40606.0214,43197.87128,45773.19946,44299.50578,42799.24319,42845.31827,42541.62079,35686.64218,28666.53657,29344.04318,28440.50589,30247.35765,32682.93056,33710.17507,34531.19074,35285.33112,36567.71261,35761.8125,35399.95306,35435.29833,35496.9804,35926.98045,36873.32095,35147.36585,33560.47542,34265.80412,35127.4948224098],
    //     [80273.4276875271,75002.66078,69047.85652,68685.79475,70951.94597,74992.37856,81876.91555,79985.55087,79019.80933,70829.79294,NaN,NaN,NaN,NaN,64921.36542,64990.16615,64510.44435,58947.91019,53137.37448,53065.62087,52873.04214,50337.8122,47225.56737,42781.51299,37997.23798,36857.38971,35729.55348,33223.02361,30752.85295,38789.50206,46817.38732,49084.43415,51406.21575,47445.70124,43538.71821,36835.31422,30213.01959,34092.3841,37760.76383,39317.69914,41809.98858,39491.39339,37242.75082,39909.33392,42744.0948,40277.70684,37788.16076,39819.66409,42093.73892,43115.19016,44479.72465,44476.72403,44459.57906,44877.11344,44335.55218,44463.33323,46674.95768,43477.76773,40491.08146,34899.85069,29570.42516,28818.91992,28072.67308,32128.38139,36217.24818,37874.14501,39696.8104,39272.7614,38757.02864,39867.85324,40969.97934,39812.01573,38984.48821,40382.9679,42417.20084,40614.43891,38776.0727,37004.08054,35098.6085609275],
    //     [69971.1264670603,68909.66138,69008.95119,71819.22329,76787.39053,79900.30251,84033.05637,83701.92723,82832.53244,69989.15577,NaN,NaN,NaN,NaN,78711.72341,72942.69529,66334.82114,61568.26792,56795.36656,55473.96796,53051.52246,50427.62603,47345.09153,42114.92774,37090.03862,35919.22665,33480.0126,32626.76963,31796.51289,39178.41424,46526.89266,52125.26796,58187.58214,49525.1303,41017.74235,35847.92394,30735.28068,33920.32594,37105.70797,41532.27614,46610.42101,42447.26635,37164.75504,40496.48507,43846.32161,41426.7039,39003.78893,40223.38449,41705.39622,43622.13792,45931.92227,44908.61522,44648.94512,46889.11067,46717.45525,44116.25649,42362.91627,38797.79143,36102.23097,33268.97863,30408.02079,32994.07942,35657.89644,37177.52172,37789.86077,38453.70076,40094.73624,39597.89305,39882.91792,39823.68125,40004.38672,42091.23758,42562.30677,42508.00933,42174.61892,41694.11293,40835.18805,39457.85506,37903.0856908449],
    //     [65057.9496677201,66495.22587,67009.99409,70024.48822,73798.50884,75875.66531,78373.44362,78416.64738,76990.56405,77939.32989,72511.39922,NaN,NaN,NaN,NaN,70225.83907,63942.92348,58630.46551,55637.50004,52321.60506,49286.23089,45893.83099,42775.36555,39851.60511,37455.68555,38321.92773,36848.26434,36803.90184,33327.8227,41970.58684,51022.94682,51453.80466,52186.3849,46918.89839,42004.25487,36366.95064,30614.75179,35009.21267,39025.10981,39250.24367,39844.21619,39489.24215,39144.60126,43008.11669,46869.25483,41488.18129,36538.24233,38904.04569,41331.32796,42208.61504,43173.75677,45605.94909,47977.52047,45953.43415,43726.61931,44312.14225,44672.46538,39684.79394,34046.50542,34255.41593,33719.4538,36267.61961,38897.73774,37098.12961,35526.06345,37526.13997,39845.22717,40173.31961,40294.63822,39023.57257,38250.46238,38719.36009,39112.62107,39091.90122,39836.62676,38899.18968,38594.6792,38097.17208,38823.75854217],
    //     [NaN,61971.3815,69377.58114,73547.2431,75630.18375,77345.18651,77224.71339,75284.00103,75159.06132,67924.72987,60275.01533,NaN,NaN,NaN,NaN,78358.58101,75061.63459,64447.59048,53883.15915,49456.83522,47350.30507,43176.63703,40022.90479,40910.12774,41521.79797,38111.38924,34659.36596,33828.98769,32974.88838,41281.97874,49273.41231,50697.62393,52180.9737,48103.89549,44107.00529,38362.89092,32280.14294,37920.84494,43124.3015,40370.7322,38267.96171,39950.27665,40570.1521,40415.00143,40687.98567,41999.59559,42531.77181,42094.54223,41334.02321,44976.85254,48490.81717,49816.28244,50799.92363,46522.28733,42005.8355,42688.9954,44035.80941,37667.98072,31350.39754,33599.64373,35886.93059,36792.53812,37646.14309,37376.92007,37078.80232,40605.58354,42955.37584,41176.68772,39641.55925,41039.56135,42481.08618,42564.13182,42781.79195,41924.83685,41188.30557,42592.97709,43863.11645,43352.50683,42569.1000195072],
    //     [NaN,NaN,NaN,69841.76221,73656.9141,73707.24002,74319.6032,76603.08724,78748.47345,59639.18579,41686.10476,62406.89021,82422.73432,76042.63729,70449.7188,69881.66918,69172.80033,63736.62955,57649.49482,53146.38061,49256.04698,43833.82077,38581.94041,37831.50744,36964.1259,35387.86016,33900.3119,35042.44013,36099.39607,42455.45353,48725.49234,50538.72528,52720.45295,48573.00388,44393.20618,38133.30006,31927.76068,38234.19661,43759.22287,40353.30356,36727.23169,37411.54387,39145.95025,41775.56178,44248.41582,41774.47478,39367.44419,41450.14819,41942.83662,46365.83253,48869.64718,50339.06473,51103.44881,47408.71543,43391.16773,44338.66265,45452.81189,38698.26044,31915.20732,32143.86958,32378.17406,36185.57995,39981.94302,40963.36847,40676.36622,39083.4873,40585.29567,37732.84348,34365.90956,35636.11415,37876.44732,40067.56163,41774.59693,42862.44815,43790.14053,43155.37607,42253.48595,41588.64133,40208.7363171954],
    //     [NaN,NaN,NaN,66041.40741,72701.6639,74868.09608,77272.79561,76202.07036,74658.22888,61565.68993,48737.60226,60444.26339,74717.86072,79920.55927,79562.97777,77054.35409,71659.49167,65946.11489,57898.23109,53329.40545,48881.64227,45079.11957,41510.36332,36973.44005,32423.38752,35027.65617,35350.3669,33189.30918,30628.44673,38557.12514,46550.7243,49266.66121,51970.23466,47908.79654,42226.74237,37381.24176,31841.66562,40082.37276,47718.12391,42956.27228,38394.39858,39514.07248,40692.76314,42475.07633,44267.93119,41785.85678,39005.00296,40108.33432,41205.41995,42728.69698,44235.82229,45665.0268,46400.57987,43523.39238,40921.27298,40983.95541,41461.83107,36015.02203,30837.48656,34365.27942,36414.42884,37353.01559,38173.97597,41349.83727,44229.4689,39305.80497,34717.62527,34645.72588,34811.72809,33126.74487,32846.15286,35551.8995,39037.13566,39155.38277,39635.6409,39870.15389,40299.33883,39927.61212,40006.8554063604],
    //     [NaN,NaN,NaN,NaN,73121.12127,75479.64747,78675.01848,77381.15675,76927.82399,69794.05712,62366.94109,70329.36138,77908.26443,77976.71563,77889.68009,74448.60649,70976.64394,64560.21905,58261.53404,52168.19329,48680.54687,42993.59776,39073.2291,37102.0625,35792.07765,34415.56455,33015.0967,31140.75912,29222.22383,38080.61159,48003.55514,53725.83117,59228.76099,49421.71787,39450.79659,35521.8604,31484.34551,38906.31342,46378.66548,40906.17176,35220.1784,40103.31355,44223.13733,44544.51621,45432.54417,43812.11518,41986.72228,42142.8698,42050.45052,44059.6886,46591.00408,44524.5662,43414.21007,44106.28582,45418.72678,46163.00711,46015.70583,38801.7277,31580.20329,33639.89069,35665.45237,39024.92489,42308.6613,43373.56647,44322.60173,40516.83711,35849.92533,36688.08275,37491.55385,38573.51808,39567.66199,42429.72063,44716.37508,42013.03104,38858.94459,39052.55688,39741.39013,38426.71438,37080.7271912902],
    //     [NaN,NaN,NaN,NaN,NaN,77197.87995,85061.2739,83121.42965,80622.30381,75690.4595,70686.68301,73237.23782,76218.00992,76435.658,76644.24746,73078.599,69772.37832,61388.54605,54766.33417,52043.9978,49712.91469,44787.77865,39333.91104,37940.09774,36268.34163,34262.22257,32461.27226,31065.21462,29734.93073,41017.34929,52308.65297,51676.69188,52246.90961,46524.21893,40812.71368,36046.53243,31256.5178,37909.10043,44560.46071,39143.30946,33337.88821,35146.51006,39421.44639,41579.1036,43722.80487,43201.92787,42900.27666,41350.75908,39066.67216,45373.45646,51526.90357,47693.26669,43833.75807,41811.96197,41354.31127,45625.36991,49616.04633,41704.62726,33096.10929,35935.69001,38687.45444,37771.50985,36899.17291,40200.72609,43296.85646,40742.71514,37096.57933,33171.19961,28942.51052,38004.28711,48734.82957,48537.70145,48300.29532,45169.52241,42014.68986,44439.50668,46922.72449,41786.34881,37116.7301964458],
    //     [NaN,NaN,NaN,NaN,NaN,57219.46351,81229.70824,72495.21975,59299.51688,60320.00658,65801.01355,71689.58554,74590.28311,64423.70201,61829.88661,62648.62904,63120.43372,54726.94884,45618.78322,47894.57646,50071.95699,46560.44762,40707.83825,39153.96796,35108.04579,33523.17138,28385.99619,30880.03121,30378.06738,38102.57007,46477.79358,48667.5008,51746.95462,46306.38754,40405.05557,36514.01318,32238.78798,39121.91268,46187.84167,39272.28411,32493.99509,38473.9402,44504.20779,43571.03725,42603.82605,43545.57316,44916.40662,44870.31686,44838.32849,47749.6456,50684.7764,46778.2962,43486.17859,43283.00999,43022.76267,46464.48372,49928.04918,40093.61545,30426.85143,33241.65196,36970.44335,38590.04023,38973.35273,40511.13542,42579.8742,37735.1754,33027.07061,32111.72967,29998.9121,41755.34776,53514.87108,54572.63421,56210.28504,48359.75017,42005.32106,42729.03752,43358.44122,40730.28582,36513.3926623705],
    //         [NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,23797.66675,23306.17719,22814.68762,22323.19806,21831.70849,21340.21893,20848.72936,20357.2398,20536.54083,27822.77035,35108.99988,33599.71852,35601.38482,38242.57,38835.46843,38862.10348,38382.26081,37413.83587,36445.41092,35476.98598,34508.56104,32253.33866,29217.44683,29910.15089,37495.52302,47028.10825,47038.0606,46391.07376,38539.82231,30697.77109,30945.46131,31295.99965,34363.27981,37292.51797,38329.86933,38333.76048,36965.194,34206.43877,40392.35449,46534.83994,56737.51526,66927.55866,65665.92466,64667.89173,54644.58719,44054.51444,40961.47611,38363.32078,36839.46336,35366.6808970798],
    //     [NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,NaN,19490.85697,18936.03159,18283.60101,23745.48199,27640.43901,23898.74366,21659.5637091928]]
    // ;
    // zValues = math.sin(xe);
    // var xe = new;
    // var ye = xe;
    // var zValues =
    function plottest(xe, ye, zValues) {
        var hm = {
            x: xe,
            // y: ye.map(function(yi) { return yi + yShift; }),
            y: ye,
            z: zValues,
            type: 'heatmap',
            colorscale: 'Jet',
            zsmooth: 'best'
        };

        var axisTemplate = {
            // range: [0, 100],
            autorange: true,
            showgrid: false,
            zeroline: false,
            showticklabels: true,
            ticks: ''
        };

        // var data = [spiralTrace, hm];
        var data = [hm];

        // var layout = {
        //     title: 'Heatmap with Unequal Block Sizes',
        //     margin: {
        //         t: 100,
        //         r: 100,
        //         b: 100,
        //         l: 100
        //     },
        //     xaxis: axisTemplate,
        //     yaxis: axisTemplate,
        //     showlegend: false,
        //     width: 1500,
        //     height: 900,
        //     autosize: true
        // };
        var layout = {
            title: 'aaaaaaaaaaaaaa',
            width: 1500,
            height: 900,
            xaxis: {
                showgrid: false,
                zeroline: false,
                showticklabels: false,
                ticks: '',
                autorange: true
            },
            yaxis: {
                showgrid: false,
                zeroline: false,
                showticklabels: false,
                ticks: '',
                scaleanchor : "x",
                scaleratio : 1,
                autorange: true
            }
        };

        Plotly.newPlot('plotpanel', data, layout);
        var plotpanel = document.getElementById('plotpanel');

        plotpanel.on('plotly_click', function(data){
            var pts = '';
            for(var i=0; i < data.points.length; i++){
                pts = 'x = '+data.points[i].x +'\ny = '+
                    data.points[i].y.toPrecision(3) + '\nz = '+ data.points[i].z + '\n';
            }
            alert('Closest point clicked:\n\n'+pts);
            // alert('Closest point clicked:\n\n');
        });
    }

    $(document).on('click', '#creatzip', function () {
        Plotly.toImage(plotpanel, {format: 'png', width: 800, height: 600}).then(function(dataUrl) {
            // use the dataUrl  data:image/png;base64,iVBORw
            // console.log(dataUrl.slice(21));
            var imgData = dataUrl.slice(21);
            var zip = new JSZip();
            zip.file("Hello.txt", "mapping file\n");
            var img = zip.folder("images");
            // var imgData = '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';
            img.file("Fe.png", imgData, {base64: true});
            zip.generateAsync({type:"blob"})
                .then(function(content) {
                    // see FileSaver.js
                    saveAs(content, "example.zip");
                });
        });

    });







    //日期
    // laydate.render({
    //     elem: '#date'
    // });
    // laydate.render({
    //     elem: '#date1'
    // });

    //创建一个编辑器
    // var editIndex = layedit.build('LAY_demo_editor');

    //自定义验证规则
    form.verify({
        title: function(value){
            if(value.length < 5){
                return '标题至少得5个字符啊';
            }
        }
        ,pass: [
            /^[\S]{6,12}$/
            ,'密码必须6到12位，且不能出现空格'
        ]
        ,content: function(value){
            layedit.sync(editIndex);
        }
    });

    //监听指定开关
    form.on('switch(switchTest)', function(data){
        layer.msg('开关checked：'+ (this.checked ? 'true' : 'false'), {
            offset: '6px'
        });
        layer.tips('温馨提示：请注意开关状态的文字可以随意定义，而不仅仅是ON|OFF', data.othis)
    });

    //监听提交
    form.on('submit(demo1)', function(data){
        layer.alert(JSON.stringify(data.field), {
            title: '最终的提交信息'
        });
        return false;
    });

    //表单赋值
    layui.$('#LAY-component-form-setval').on('click', function(){
        form.val('example', {
            "username": "贤心" // "name": "value"
            ,"password": "123456"
            ,"interest": 1
            ,"like[write]": true //复选框选中状态
            ,"close": true //开关状态
            ,"sex": "女"
            ,"desc": "我爱 layui"
        });
    });

    //表单取值
    layui.$('#LAY-component-form-getval').on('click', function(){
        var data = form.val('example');
        alert(JSON.stringify(data));
    });

    // //Hash地址的定位
    // var layid = location.hash.replace(/^#test=/, '');
    // element.tabChange('test', layid);
    //
    // element.on('tab(test)', function(elem){
    //     location.hash = 'test='+ $(this).attr('lay-id');
    // });

});