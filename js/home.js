
new Vue({
	el: '#container',
	data: {
		cakelist: [],  //存储所有蛋糕列表
		orderlist: [], //存储所有订单
		cakeid: [], //存储当前选中的蛋糕id
		userid: '', //当前user的id 
		orderid: '', //选中的订单的id 
		currentPage: 1, //默认显示首页 
		cakemess: {}, //单个蛋糕的信息
		imgFlag: 1, //控制轮播图片 
		curUserOrder: [], //当前用户的订单信息
		userCake: [], //存储订单和蛋糕的信息，因为订单中只有id信息
		checked: false, //控制全选
		delitem: false, //控制删除警告框要显示还是隐藏
		insertitem: false, //控制添加地址信息框的显示隐藏
		cakeId: '', ////存储当前选中的蛋糕id
		addresslist: [], //存储用户的地址列表
		newaddr: '', //新加的地址名
		newtel: '', //新加的电话号码
		currentindex:0, //在设置默认地址时存储用户选中的地址索引
		addressindex: 0, //存储要删除的地址索引
		flag: 1, //用于控制显示哪一个header,订购成功和加入购物车成功共用一个页面
		userlist: [], //获得所有用户信息
		user: {} //当前用户的信息
	},
	//页面加载时的初始化
	mounted: function (){
		var _this = this;
		//读取json文件，获得所有蛋糕信息
		_this.$http.get("../json/cakelist.json").then(function (res){
			_this.cakelist = res.body.result.list;
		}).catch(function (error){
			console.log(error);
		});

		//读取当前用户的所有订单信息
		_this.$http.get("../json/orderlist.json").then(function (res){
			_this.orderlist = res.body.result.list;
			_this.orderlist.forEach(function (item){
				if (item.userId === '002'){
					_this.curUserOrder.push(item);
				}
			});
		}).catch(function (error){
			console.log(error);
		});
	},
	methods: {
		//点击蛋糕卡片时进入蛋糕详情页面
		buyit: function (itemid){
			var _this = this;
			_this.cakeId = itemid;
			_this.cakelist.forEach(function (item, index){
				if (item.cakeId == _this.cakeId){ //根据所点击的蛋糕获得具体信息
					_this.cakemess = item;
				}
			});
			_this.currentPage = 2;
			_this.animation(); //初始化动画
		},

		//蛋糕图片的轮播动画
		animation: function (){
			var _this = this;
			setInterval(function (){
				if (_this.imgFlag == 3){
					_this.imgFlag = 1;
				}else{
					_this.imgFlag++;
				}
			}, 3000);
		},

		//获得用户的所有地址信息
		filladdress: function (tag){
			var _this = this;
			_this.$http.get("../json/addresslist.json").then(function (res){
				_this.addresslist = res.body.result.list;
				_this.flag = tag;
				_this.currentPage = 6;
			}).catch(function (error){
				console.log(error);
			});
		},

		//加入购物车
		incart: function(){
			this.flag = 0;
			this.currentPage = 7;
		},

		//获得所有订单详情
		allorder: function (tag){
			var _this = this;
			_this.userCake = [];
			for (var i = 0; i < _this.curUserOrder.length; i++){
				for (var j = 0; j < _this.cakelist.length; j++){
					if (_this.curUserOrder[i].cakeId == _this.cakelist[j].cakeId){
						var ordermess = {
							"cakeId": '',
							"cakeName": '',
							"cakeImg1": '',
							"cakePrice": 0,
							"cakeMess": '',
							'orderTime': '',
							'orderQuantity': 0,
							'checked': false
						};
						ordermess.cakeId = _this.cakelist[j].cakeId;
						ordermess.cakeName = _this.cakelist[j].cakeName;
						ordermess.cakeImg1 = _this.cakelist[j].cakeImg1;
						ordermess.cakePrice = _this.cakelist[j].cakePrice;
						ordermess.cakeMess = _this.cakelist[j].cakeMess;
						ordermess.orderTime = _this.curUserOrder[i].orderTime;
						ordermess.orderQuantity = _this.curUserOrder[i].orderQuantity;
						_this.userCake.push(ordermess);
						break;
					}
				}
			}
			_this.currentPage = 4;
			_this.flag = tag;
		},
		//点击选中所有按钮时执行
		checkall: function(){
			this.checked = !this.checked;
			if (this.checked == true){
				this.userCake.forEach(function (item){
					item.checked = true;
				});
			}else{
				this.userCake.forEach(function (item){
					item.checked = false;
				});
			}
		},
		//选中某一个订单时，让选中所有失效
		checkit: function(item){
			item.checked = !item.checked;
			if (!item.checked){
				this.checked = false;
			}
		},
		//确认删除选中订单
		sure: function(){
			var pre = i = 0;
			this.delitem = false;
			this.checked = false;
			while(i < this.userCake.length){
				if (this.userCake[i].checked == true){
					this.userCake.splice(i, 1);
				}
				if (this.userCake[pre].checked == true){
					i = pre;
				}else{
					pre = i;
					i++;
				}
			}
		},
		//让删除警告框显示
		delit: function (){
			this.delitem = true;
		},
		//提交要添加的新地址
		submit: function(){
			var addritem = {
				"address": this.newaddr,
				"tel": this.newtel,
				"default": false
			};
			this.addresslist.push(addritem);
			this.insertitem=false;
			this.newaddr = '';
			this.newtel = '';
		},
		//获得要删除的地址索引
		deleteitem: function(index){
			this.addressindex = index;
			this.delitem = true;
		},
		//确认删除地址
		sureit: function(){
			this.addresslist.splice(this.addressindex, 1);
			this.delitem = false;
		},
		//控制显示支付成功页面
		payment: function(){
			this.currentPage = 7;
		},
		//获得用户信息，显示个人中心页
		my: function(){
			var _this = this;
			_this.$http.get("../json/userlist.json").then(function (res){
				_this.userlist = res.body.result.list;
				_this.userlist.forEach(function (item){
					if (item.userId == '002'){
						_this.user = item;
					}
				});
				_this.currentPage = 3;
			}).catch(function (error){
				console.log(error);
			});
		}
	},
	//用过滤器对金钱进行格式化
	filters: {
		moneyFormat: function (value, tag, type){
			return tag + value.toFixed(2) + type;
		}
	}
});

