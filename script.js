var lat, lng;
var map;
var marker = [];
var infowindow = [];
var markerdata = [];


//中央座標
var center = {
	lat: 35.57066599,
	lng: 139.37388145
};

window.onload = function() {
  iniMap(center);
}

//Google Map設定
function iniMap(center) {
	if (navigator.geolocation) {
		//現在地取得
        navigator.geolocation.getCurrentPosition(
          function(position) {
			//現在地の座標
            var currentLatLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
			map = new google.maps.Map(document.getElementById("map"),{
				center: currentLatLng,
				zoom: 15,
				clickableIcons: false,
				streetViewControl: false,
				fullscreenControl: false,
				styles: [{
					featureType: 'poi.medical',
					elementType: 'labels',
					stylers: [{ visibility: 'off' }]
				}]
			});

			//現在地のマーカー
			var marker = new google.maps.Marker({
				map : map,
				position : currentLatLng,
				animation: google.maps.Animation.DROP,
				icon: {
					fillColor: "#0000FF",
					fillOpacity: 1.0,
					path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
					scale: 8,
					strokeColor: "#0000FF",
					strokeWeight: 1.0
				}
			  });

			callNext(map);
		},
		function(error) {
            switch(error.code) {
				case 1:
					alert("位置情報の利用が許可されていません");
                	break;
              	case 2:
                	alert("現在位置が取得できませんでした");
                	break;
              	case 3:
					alert("タイムアウトになりました");
					break;
              	default:
					alert("その他のエラー(エラーコード:"+error.code+")");
					break;
				}
				map = new google.maps.Map(document.getElementById("map"),{
					center: center,
					zoom: 10,
					clickableIcons: false,
					streetViewControl: false,
					fullscreenControl: false,
					styles: [{
						featureType: 'poi.medical',
						elementType: 'labels',
						stylers: [{ visibility: 'off' }]
					}]
				});
				callNext(map);
			}
			);
		} else {
			alert("この端末では位置情報が取得できません");

			map = new google.maps.Map(document.getElementById("map"),{
				center: center,
				zoom: 10,
				clickableIcons: false,
				streetViewControl: false,
				fullscreenControl: false,
				styles: [{
					featureType: 'poi.medical',
					elementType: 'labels',
					stylers: [{ visibility: 'off' }]
				}]
			});
		callNext(map);
	}
}

function callNext(map){
	const centerControlDiv = document.createElement("div");
	CenterControl(centerControlDiv, map);
	centerControlDiv.index = 1;
	map.controls[google.maps.ControlPosition.TOP_LEFT].push(centerControlDiv);
	GetData();
}

//読み込み
function GetData(){
	var data = new XMLHttpRequest();
	data.onload = function() {
		CreateMarker(data);
    };
	data.open("GET", "https://api.kamiya-y.jp/medical-institution/status/index.php", true);
	data.send(null);
}

//医療機関のマーカーの設定
function CreateMarker(response) {
    var data = JSON.parse(response.responseText);
	for(var i = 0; i < data.length; i++){
		markerLatLng = new google.maps.LatLng({lat: Number(data[i].latitude), lng: Number(data[i].longitude)});
		var markerIcon = "";

		if((data[i].ansType || data[i+1].ansType || data[i+2].ansType) == '設置なし'){
			markerIcon = "https://kamiya-y.jp/works/archive/MedicalStatusMap/img/limegreen.png";
		}else if((data[i].ansType || data[i+1].ansType || data[i+2].ansType) == '通常'){
			markerIcon = "https://kamiya-y.jp/works/archive/MedicalStatusMap/img/limegreen.png";
		}else if((data[i].ansType || data[i+1].ansType || data[i+2].ansType) == '未回答'){
			markerIcon = "https://kamiya-y.jp/works/archive/MedicalStatusMap/img/orange.png";
		}else if((data[i].ansType || data[i+1].ansType || data[i+2].ansType) == '制限'){
			markerIcon = "https://kamiya-y.jp/works/archive/MedicalStatusMap/img/orangered.png";
		}else if((data[i].ansType || data[i+1].ansType || data[i+2].ansType) == '停止'){
			markerIcon = "https://kamiya-y.jp/works/archive/MedicalStatusMap/img/red.png";
		}

		marker[i] = new google.maps.Marker({
			map: map,
			position: markerLatLng,
			icon: markerIcon
		});

		//吹き出し
		var text = '';
		text += (data[i].facilityName).fontcolor("fuchsia").fontsize("4") + '</br>';
		text += '</br>';
		text += (data[i+1].facilityType + ": ").fontsize("3") + setColor(data[i+1].ansType).fontsize("3") + '</br>';
		text += (data[i].facilityType + ": ").fontsize("3") + setColor(data[i].ansType).fontsize("3") + '</br>';
		text += (data[i+2].facilityType + ": ").fontsize("3") + setColor(data[i+2].ansType).fontsize("3") + '</br>';
		text += '<a href="tel:' + (data[i].facilityTel) + '" style="color : black;text-decoration: none;">' + '電話番号: '.fontsize("3") + (format_phone_number(data[i].facilityTel)).fontcolor("blue").fontsize("3") + '</a></br>';

		infowindow[i] = new google.maps.InfoWindow({
			content: text,
		});
		markerEvent(i);
		i += 2;
    }
}

//マーカーの動作設定
function markerEvent(i){
	marker[i].addListener('mouseover', function(){
		infowindow[i].open(map, marker[i]);
	  });

	marker[i].addListener('mouseout', function(){
		infowindow[i].close(map, marker[i]);
	  });
}

//マーカー設定
function toggleBounce(i) {
	if (marker[i].getAnimation() !== null) {
	  marker[i].setAnimation(null);
	} else {
	  marker[i].setAnimation(google.maps.Animation.BOUNCE);
	}
}

//受け入れ状況設定
function setColor(input){
	switch(input){
		case '通常':
			input = input.fontcolor('blue');
			break;
		case '制限':
			input = input.fontcolor('orangered').bold();
			break;
		case '停止':
			input = input.fontcolor('red').bold();
			break;
		case '未回答':
			input = input.fontcolor("orange");
			break;
	}
	return input;
}

function format_phone_number(input) {
	var groups = [];
  
	groups[5] = {
		'01564' : 1,
		'01558' : 1,
		'01586' : 1,
		'01587' : 1,
		'01634' : 1,
		'01632' : 1,
		'01547' : 1,
		'05769' : 1,
		'04992' : 1,
		'04994' : 1,
		'01456' : 1,
		'01457' : 1,
		'01466' : 1,
		'01635' : 1,
		'09496' : 1,
		'08477' : 1,
		'08512' : 1,
		'08396' : 1,
		'08388' : 1,
		'08387' : 1,
		'08514' : 1,
		'07468' : 1,
		'01655' : 1,
		'01648' : 1,
		'01656' : 1,
		'01658' : 1,
		'05979' : 1,
		'04996' : 1,
		'01654' : 1,
		'01372' : 1,
		'01374' : 1,
		'09969' : 1,
		'09802' : 1,
		'09912' : 1,
		'09913' : 1,
		'01398' : 1,
		'01377' : 1,
		'01267' : 1,
		'04998' : 1,
		'01397' : 1,
		'01392' : 1,
	};
	groups[4] = {
		'0768' : 2,
		'0770' : 2,
		'0772' : 2,
		'0774' : 2,
		'0773' : 2,
		'0767' : 2,
		'0771' : 2,
		'0765' : 2,
		'0748' : 2,
		'0747' : 2,
		'0746' : 2,
		'0826' : 2,
		'0749' : 2,
		'0776' : 2,
		'0763' : 2,
		'0761' : 2,
		'0766' : 2,
		'0778' : 2,
		'0824' : 2,
		'0797' : 2,
		'0796' : 2,
		'0555' : 2,
		'0823' : 2,
		'0798' : 2,
		'0554' : 2,
		'0820' : 2,
		'0795' : 2,
		'0556' : 2,
		'0791' : 2,
		'0790' : 2,
		'0779' : 2,
		'0558' : 2,
		'0745' : 2,
		'0794' : 2,
		'0557' : 2,
		'0799' : 2,
		'0738' : 2,
		'0567' : 2,
		'0568' : 2,
		'0585' : 2,
		'0586' : 2,
		'0566' : 2,
		'0564' : 2,
		'0565' : 2,
		'0587' : 2,
		'0584' : 2,
		'0581' : 2,
		'0572' : 2,
		'0574' : 2,
		'0573' : 2,
		'0575' : 2,
		'0576' : 2,
		'0578' : 2,
		'0577' : 2,
		'0569' : 2,
		'0594' : 2,
		'0827' : 2,
		'0736' : 2,
		'0735' : 2,
		'0725' : 2,
		'0737' : 2,
		'0739' : 2,
		'0743' : 2,
		'0742' : 2,
		'0740' : 2,
		'0721' : 2,
		'0599' : 2,
		'0561' : 2,
		'0562' : 2,
		'0563' : 2,
		'0595' : 2,
		'0596' : 2,
		'0598' : 2,
		'0597' : 2,
		'0744' : 2,
		'0852' : 2,
		'0956' : 2,
		'0955' : 2,
		'0954' : 2,
		'0952' : 2,
		'0957' : 2,
		'0959' : 2,
		'0966' : 2,
		'0965' : 2,
		'0964' : 2,
		'0950' : 2,
		'0949' : 2,
		'0942' : 2,
		'0940' : 2,
		'0930' : 2,
		'0943' : 2,
		'0944' : 2,
		'0948' : 2,
		'0947' : 2,
		'0946' : 2,
		'0967' : 2,
		'0968' : 2,
		'0987' : 2,
		'0986' : 2,
		'0985' : 2,
		'0984' : 2,
		'0993' : 2,
		'0994' : 2,
		'0997' : 2,
		'0996' : 2,
		'0995' : 2,
		'0983' : 2,
		'0982' : 2,
		'0973' : 2,
		'0972' : 2,
		'0969' : 2,
		'0974' : 2,
		'0977' : 2,
		'0980' : 2,
		'0979' : 2,
		'0978' : 2,
		'0920' : 2,
		'0898' : 2,
		'0855' : 2,
		'0854' : 2,
		'0853' : 2,
		'0553' : 2,
		'0856' : 2,
		'0857' : 2,
		'0863' : 2,
		'0859' : 2,
		'0858' : 2,
		'0848' : 2,
		'0847' : 2,
		'0835' : 2,
		'0834' : 2,
		'0833' : 2,
		'0836' : 2,
		'0837' : 2,
		'0846' : 2,
		'0845' : 2,
		'0838' : 2,
		'0865' : 2,
		'0866' : 2,
		'0892' : 2,
		'0889' : 2,
		'0887' : 2,
		'0893' : 2,
		'0894' : 2,
		'0897' : 2,
		'0896' : 2,
		'0895' : 2,
		'0885' : 2,
		'0884' : 2,
		'0869' : 2,
		'0868' : 2,
		'0867' : 2,
		'0875' : 2,
		'0877' : 2,
		'0883' : 2,
		'0880' : 2,
		'0879' : 2,
		'0829' : 2,
		'0550' : 2,
		'0228' : 2,
		'0226' : 2,
		'0225' : 2,
		'0224' : 2,
		'0229' : 2,
		'0233' : 2,
		'0237' : 2,
		'0235' : 2,
		'0234' : 2,
		'0223' : 2,
		'0220' : 2,
		'0192' : 2,
		'0191' : 2,
		'0187' : 2,
		'0193' : 2,
		'0194' : 2,
		'0198' : 2,
		'0197' : 2,
		'0195' : 2,
		'0238' : 2,
		'0240' : 2,
		'0260' : 2,
		'0259' : 2,
		'0258' : 2,
		'0257' : 2,
		'0261' : 2,
		'0263' : 2,
		'0266' : 2,
		'0265' : 2,
		'0264' : 2,
		'0256' : 2,
		'0255' : 2,
		'0243' : 2,
		'0242' : 2,
		'0241' : 2,
		'0244' : 2,
		'0246' : 2,
		'0254' : 2,
		'0248' : 2,
		'0247' : 2,
		'0186' : 2,
		'0185' : 2,
		'0144' : 2,
		'0143' : 2,
		'0142' : 2,
		'0139' : 2,
		'0145' : 2,
		'0146' : 2,
		'0154' : 2,
		'0153' : 2,
		'0152' : 2,
		'0138' : 2,
		'0137' : 2,
		'0125' : 2,
		'0124' : 2,
		'0123' : 2,
		'0126' : 2,
		'0133' : 2,
		'0136' : 2,
		'0135' : 2,
		'0134' : 2,
		'0155' : 2,
		'0156' : 2,
		'0176' : 2,
		'0175' : 2,
		'0174' : 2,
		'0178' : 2,
		'0179' : 2,
		'0184' : 2,
		'0183' : 2,
		'0182' : 2,
		'0173' : 2,
		'0172' : 2,
		'0162' : 2,
		'0158' : 2,
		'0157' : 2,
		'0163' : 2,
		'0164' : 2,
		'0167' : 2,
		'0166' : 2,
		'0165' : 2,
		'0267' : 2,
		'0250' : 2,
		'0533' : 2,
		'0422' : 2,
		'0532' : 2,
		'0531' : 2,
		'0436' : 2,
		'0428' : 2,
		'0536' : 2,
		'0299' : 2,
		'0294' : 2,
		'0293' : 2,
		'0475' : 2,
		'0295' : 2,
		'0297' : 2,
		'0296' : 2,
		'0495' : 2,
		'0438' : 2,
		'0466' : 2,
		'0465' : 2,
		'0467' : 2,
		'0478' : 2,
		'0476' : 2,
		'0470' : 2,
		'0463' : 2,
		'0479' : 2,
		'0493' : 2,
		'0494' : 2,
		'0439' : 2,
		'0268' : 2,
		'0480' : 2,
		'0460' : 2,
		'0538' : 2,
		'0537' : 2,
		'0539' : 2,
		'0279' : 2,
		'0548' : 2,
		'0280' : 2,
		'0282' : 2,
		'0278' : 2,
		'0277' : 2,
		'0269' : 2,
		'0270' : 2,
		'0274' : 2,
		'0276' : 2,
		'0283' : 2,
		'0551' : 2,
		'0289' : 2,
		'0287' : 2,
		'0547' : 2,
		'0288' : 2,
		'0544' : 2,
		'0545' : 2,
		'0284' : 2,
		'0291' : 2,
		'0285' : 2,
		'0120' : 3,
		'0570' : 3,
		'0800' : 3,
		'0990' : 3,
	};
	groups[3] = {
		'020' : 3,
		'070' : 3,
		'080' : 3,
		'090' : 3,
		'099' : 3,
		'054' : 3,
		'058' : 3,
		'098' : 3,
		'095' : 3,
		'097' : 3,
		'052' : 3,
		'053' : 3,
		'011' : 3,
		'096' : 3,
		'049' : 3,
		'015' : 3,
		'048' : 3,
		'072' : 3,
		'084' : 3,
		'028' : 3,
		'024' : 3,
		'076' : 3,
		'023' : 3,
		'047' : 3,
		'029' : 3,
		'075' : 3,
		'025' : 3,
		'055' : 3,
		'026' : 3,
		'079' : 3,
		'082' : 3,
		'027' : 3,
		'078' : 3,
		'077' : 3,
		'083' : 3,
		'022' : 3,
		'086' : 3,
		'089' : 3,
		'045' : 3,
		'044' : 3,
		'092' : 3,
		'046' : 3,
		'017' : 3,
		'093' : 3,
		'059' : 3,
		'073' : 3,
		'019' : 3,
		'087' : 3,
		'042' : 3,
		'018' : 3,
		'043' : 3,
		'088' : 3,
		'050' : 4,
	};
	groups[2] = {
		'04' : 4,
		'03' : 4,
		'06' : 4,
	};
	groups[6] = {
		'aa' : 4,
		'bb' : 4,
	};
  
	var number = input.replace('/[^\d]++/', '');
  
	groups.forEach(function (data, i){
	  var area = number.slice(0,i);
  
	  if(data[area]){
		var formatted = '';
		var test1 = number.slice(0,i);
		var test2 = number.slice(i,i+data[area]);
		var test3 = number.slice(i+data[area]);
  
		tel = test1 + '-' + test2 + '-' + test3;
	  }
	});

	return tel;
}

//マーカー表示切替ボタン設定
function CenterControl(controlDiv, map) {
	const controlUI = document.createElement("div");
	controlUI.style.backgroundColor = "#fff";
	controlUI.style.boxShadow = "0 2px 6px rgba(0,0,0,.3)";
	controlUI.style.cursor = "pointer";
	controlUI.style.marginTop = "10px";
	controlUI.style.marginBottom = "22px";
	controlUI.style.textAlign = "center";
	controlUI.title = "マーカーの表示切替";
	controlDiv.appendChild(controlUI);
	const controlText = document.createElement("div");
	controlText.style.color = "rgb(25,25,25)";
	controlText.style.fontFamily = "Roboto,Arial,sans-serif";
	controlText.style.fontSize = "18px";
	controlText.style.lineHeight = "39px";
	controlText.style.paddingLeft = "17px";
	controlText.style.paddingRight = "17px";
	controlText.innerHTML = "マーカー";
	controlUI.appendChild(controlText);
	controlUI.addEventListener("click", () => {
		if(marker[0].getVisible() == true){
			for(var i = 0; i < marker.length; i++){
				marker[i].setVisible(false);
				i += 2;
			}
		  }else{
			for(var i = 0; i < marker.length; i++){
				marker[i].setVisible(true);
				i += 2;
			}
		  }
	});
  }