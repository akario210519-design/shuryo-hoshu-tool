import { useState, useMemo, useEffect } from "react";

const C = {
  bg:"#1a1914", card:"#242219", card2:"#2d2b1f",
  sel:"#3a3724", selBdr:"#8b7440", gold:"#c9a77c",
  goldBr:"#e0b96c", text:"#e5dccc", muted:"#7a7060",
  dim:"#4a4538", border:"#38351e", green:"#4ade80", red:"#f87171",
};
const CAP_LABELS = ["20人以下","21〜40人","41〜60人","61〜80人","81人以上"];
const CAP_KEYS   = ["≤20","21-40","41-60","61-80","81+"];
const A_RODO = [
  {label:"① 1日の平均労働時間が7時間以上",pts:90},
  {label:"② 6時間以上7時間未満",pts:80},
  {label:"③ 5時間以上6時間未満",pts:65},
  {label:"④ 4時間30分以上5時間未満",pts:55},
  {label:"⑤ 4時間以上4時間30分未満",pts:40},
  {label:"⑥ 3時間以上4時間未満",pts:30},
  {label:"⑦ 2時間以上3時間未満",pts:20},
  {label:"⑧ 2時間未満",pts:5},
];
const A_SEISAN = [
  {label:"① 過去3年の生産活動収支がそれぞれ利用者賃金総額以上",pts:60},
  {label:"② 前年度・前々年度の各年度が利用者賃金総額以上",pts:50},
  {label:"③ 前年度のみが利用者賃金総額以上",pts:40},
  {label:"④ 前々年度のみが利用者賃金総額以上",pts:20},
  {label:"⑤ 前年・前々年度がいずれも利用者賃金総額未満",pts:-10},
  {label:"⑥ 過去3年の生産活動収支がいずれも利用者賃金総額未満",pts:-20},
];
const A_TAYOU = [
  "① 免許・資格取得、検定の受検勧奨に関する制度（就業規則等で定めている）",
  "② 利用者を職員として登用する制度（就業規則等で定めている）",
  "③ 在宅勤務に係る労働条件及び服務規律（就業規則等で定めている）",
  "④ フレックスタイム制に係る労働条件（就業規則等で定めている）",
  "⑤ 短時間勤務に係る労働条件（就業規則等で定めている）",
  "⑥ 時差出勤制度に係る労働条件（就業規則等で定めている）",
  "⑦ 有給休暇の時間単位取得又は計画的付与制度（就業規則等で定めている）",
  "⑧ 傷病休暇等の取得に関する事項（就業規則等で定めている）",
];
const A_SHIEN = [
  "① 研修計画に基づいた外部研修会・内部研修会に参加した職員が1人以上いる",
  "② 研修・学会等または学会誌等において発表が1回以上ある",
  "③ 視察・実習の実施または受け入れのいずれか一方のみの取組を行っている",
  "④ 販路拡大の商談会等への参加が1回以上ある",
  "⑤ 人事評価結果に基づき定期に昇給を判定する制度を設け、全職員に周知している",
  "⑥ ピアサポーターを職員として配置している",
  "⑦ 過去3年以内の福祉サービス第三者評価を受審しており、結果を公表している",
  "⑧ 都道府県知事が適当と認める国際標準化規格等の認証を受けている",
];
const HACHI_PTS = n => n>=5?15:n>=3?5:0;
const scoreToIdx = s => s>=170?0:s>=150?1:s>=130?2:s>=105?3:s>=80?4:s>=60?5:6;
const A_SCORE_LABELS = ["170点以上","150点以上170点未満","130点以上150点未満","105点以上130点未満","80点以上105点未満","60点以上80点未満","60点未満"];
const A_BASE={
  "7.5:1":{"≤20":[791,733,701,666,533,419,325],"21-40":[710,656,626,594,474,373,288],"41-60":[672,619,590,558,445,350,271],"61-80":[660,609,580,547,438,344,266],"81+":[641,588,559,529,422,333,258]},
  "10:1": {"≤20":[727,671,641,608,486,382,296],"21-40":[655,604,574,543,432,341,264],"41-60":[613,563,535,505,403,318,246],"61-80":[602,552,524,495,394,311,241],"81+":[583,534,507,478,381,301,232]},
};
const A_IDOU={
  "7.5:1":{"≤20":[93,87,80,73,65,57,50],"21-40":[49,45,41,37,32,27,23],"41-60":[35,32,28,25,21,17,14],"61-80":[27,25,21,19,16,13,10],"81+":[22,20,17,16,13,11,8]},
  "10:1": {"≤20":[90,84,77,70,62,54,47],"21-40":[48,44,40,36,31,26,22],"41-60":[34,31,27,24,20,16,13],"61-80":[27,25,21,19,16,13,10],"81+":[21,19,16,15,12,10,7]},
};
const A_CHINGINKOJO={"≤20":70,"21-40":43,"41-60":26,"61-80":19,"81+":15};
const A_SHORYU=[{label:"算定しない",rate:0},{label:"（Ⅰ）イ",rate:108},{label:"（Ⅰ）ロ",rate:112},{label:"（Ⅱ）イ",rate:106},{label:"（Ⅱ）ロ",rate:110},{label:"（Ⅲ）",rate:91},{label:"（Ⅳ）",rate:75}];
const B_WAGE_LABELS=["45,000円以上","35,000〜45,000円未満","30,000〜35,000円未満","25,000〜30,000円未満","20,000〜25,000円未満","15,000〜20,000円未満","10,000〜15,000円未満","10,000円未満"];
const B_BASE={
  "6:1":  {"≤20":[837,805,758,738,726,703,673,590],"21-40":[746,717,676,660,637,624,600,526],"41-60":[700,674,636,620,600,586,563,494],"61-80":[688,662,625,609,589,575,553,485],"81+":[666,640,605,590,570,557,535,468]},
  "7.5:1":{"≤20":[748,716,669,649,637,614,584,537],"21-40":[666,637,596,580,557,544,520,478],"41-60":[625,599,561,545,525,511,488,449],"61-80":[614,588,551,535,515,501,479,440],"81+":[594,568,533,518,498,485,463,425]},
  "10:1": {"≤20":[682,653,611,594,572,557,532,490],"21-40":[609,584,547,532,511,497,475,438],"41-60":[564,541,508,493,474,461,441,405],"61-80":[554,530,498,483,465,452,432,397],"81+":[535,512,480,467,449,437,417,384]},
};
const B_IDOU={
  "6:1":  {"≤20":[93,86,79,72,65,58,51,48],"21-40":[49,44,40,36,32,28,23,22],"41-60":[35,31,28,24,21,18,14,13],"61-80":[27,24,21,18,16,13,10,9],"81+":[22,20,17,15,13,11,8,7]},
  "7.5:1":{"≤20":[93,86,79,72,65,58,51,48],"21-40":[49,44,40,36,32,28,23,22],"41-60":[35,31,28,24,21,18,14,13],"61-80":[27,24,21,18,16,13,10,9],"81+":[22,20,17,15,13,11,8,7]},
  "10:1": {"≤20":[90,83,76,69,62,55,48,45],"21-40":[48,43,39,35,31,27,22,21],"41-60":[34,30,27,23,20,17,13,12],"61-80":[27,24,21,18,16,13,10,9],"81+":[21,19,16,14,12,10,7,6]},
};
const B_MOKUHYO_SHIDOIN={"≤20":45,"21-40":40,"41-60":38,"61-80":37,"81+":36};
const B_MOKUHYO_KASAN=10;
const B_SHORYU=[{label:"算定しない",rate:0},{label:"（Ⅰ）イ",rate:105},{label:"（Ⅰ）ロ",rate:109},{label:"（Ⅱ）イ",rate:103},{label:"（Ⅱ）ロ",rate:107},{label:"（Ⅲ）",rate:88},{label:"（Ⅳ）",rate:74}];
const REGIONS=[
  {label:"1級地",rate:11.14,ex:"東京23区 等"},
  {label:"2級地",rate:10.91,ex:"横浜市・川崎市・大阪市 等"},
  {label:"3級地",rate:10.86,ex:"千葉市・さいたま市・名古屋市 等"},
  {label:"4級地",rate:10.68,ex:"相模原市・船橋市・豊中市 等"},
  {label:"5級地",rate:10.57,ex:"水戸市・広島市・福岡市 等"},
  {label:"6級地",rate:10.34,ex:"宇都宮市・仙台市・高崎市 等"},
  {label:"7級地",rate:10.17,ex:"札幌市・北九州市・長崎市 等"},
  {label:"その他",rate:10.00,ex:"上記以外の市町村"},
];
const KASAN=[
  {id:"fw1",label:"福祉専門職員配置等加算（Ⅰ）",unit:15,type:"per_day",note:"社福士・PSW等 35%以上"},
  {id:"fw2",label:"福祉専門職員配置等加算（Ⅱ）",unit:10,type:"per_day",note:"社福士・PSW等 25%以上"},
  {id:"fw3",label:"福祉専門職員配置等加算（Ⅲ）",unit:6,type:"per_day",note:"高卒等 75%以上"},
  {id:"shoku",label:"食事提供体制加算",unit:30,type:"per_target_day",note:"食事提供対象者"},
  {id:"so_r",label:"送迎加算（往復）",unit:42,type:"per_target_day",note:"往復送迎の利用者"},
  {id:"so_o",label:"送迎加算（片道）",unit:21,type:"per_target_day",note:"片道送迎の利用者"},
  {id:"knri",label:"利用者負担上限額管理加算",unit:150,type:"per_person_month",note:"上限管理対象者"},
  {id:"init",label:"初期加算",unit:30,type:"per_day_new",note:"新規利用者（30日以内）",defaultNew:1},
  {id:"kes",label:"欠席時対応加算",unit:94,type:"fixed_count",note:"月間回数（上限4回）",defaultCount:4},
];
const fmt=n=>Math.round(n).toLocaleString("ja-JP");
const fmtW=n=>`¥${fmt(n)}`;
const inp={background:C.card2,border:`1px solid ${C.border}`,borderRadius:7,padding:"6px 10px",color:C.text,fontSize:14,fontWeight:600,fontFamily:"inherit",textAlign:"right",outline:"none",width:"100%",boxSizing:"border-box"};

export default function App(){
  const [page,setPage]=useState("calc");
  // calc state
  const [type,setType]=useState("A");
  const [aScoreMode,setAScoreMode]=useState("calc");
  const [aManualIdx,setAManualIdx]=useState(4);
  const [rodoIdx,setRodoIdx]=useState(null);
  const [seisanIdx,setSeisanIdx]=useState(null);
  const [tayouChecks,setTayouChecks]=useState({});
  const [shienChecks,setShienChecks]=useState({});
  const [chiikiOn,setChiikiOn]=useState(false);
  const [keiei,setKeiei]=useState("safe");
  const [chishikiOn,setChishikiOn]=useState(false);
  const [bIdx,setBIdx]=useState(5);
  const [staffing,setStaffing]=useState("7.5:1");
  const [cap,setCap]=useState("≤20");
  const [regIdx,setRegIdx]=useState(7);
  const [users,setUsers]=useState(18);
  const [days,setDays]=useState(22);
  const [idouOn,setIdouOn]=useState(false);
  const [idouN,setIdouN]=useState(3);
  const [chinginOn,setChinginOn]=useState(false);
  const [mokuhyoShidoinOn,setMokuhyoShidoinOn]=useState(false);
  const [mokuhyoKasanOn,setMokuhyoKasanOn]=useState(false);
  const [shoryuIdx,setShoryuIdx]=useState(0);
  const [kasanOn,setKasanOn]=useState({});
  const [kasanTgt,setKasanTgt]=useState({});
  const [kasanCnt,setKasanCnt]=useState({});
  const [kasanNew,setKasanNew]=useState({});
  const [showKasan,setShowKasan]=useState(false);
  // pl state
  const [seisanNyukin,setSeisanNyukin]=useState(500000);
  const [sonotaNyukin,setSonotaNyukin]=useState(0);
  const [staff1N,setStaff1N]=useState(3);
  const [staff1S,setStaff1S]=useState(280000);
  const [staff2N,setStaff2N]=useState(2);
  const [staff2S,setStaff2S]=useState(100000);
  const [fukoriRate,setFukoriRate]=useState(15);
  const [kojinWage,setKojinWage]=useState(80000);
  const [yachin,setYachin]=useState(150000);
  const [konetsu,setKonetsu]=useState(50000);
  const [tsushin,setTsushin]=useState(20000);
  const [shomohin,setShomohin]=useState(30000);
  const [sharyo,setSharyo]=useState(40000);
  const [hoken,setHoken]=useState(20000);
  const [kenshu,setKenshu]=useState(15000);
  const [itaku,setItaku]=useState(30000);
  const [genshokyaku,setGenshokyaku]=useState(50000);
  const [sonotaShishutsu,setSonotaShishutsu]=useState(0);

  const [isMobile,setIsMobile]=useState(true);
  useEffect(()=>{
    const f=()=>setIsMobile(window.innerWidth<960);
    f(); window.addEventListener("resize",f);
    return ()=>window.removeEventListener("resize",f);
  },[]);

  const switchType=t=>{
    setType(t);setStaffing(t==="A"?"7.5:1":"6:1");
    setShoryuIdx(0);setKasanOn({});
    setIdouOn(false);setChinginOn(false);
    setMokuhyoShidoinOn(false);setMokuhyoKasanOn(false);
    setKojinWage(t==="A"?80000:15000);
  };

  const tayouCnt=Object.values(tayouChecks).filter(Boolean).length;
  const shienCnt=Object.values(shienChecks).filter(Boolean).length;
  const calcScore=useMemo(()=>{
    const s1=rodoIdx!==null?A_RODO[rodoIdx].pts:0;
    const s2=seisanIdx!==null?A_SEISAN[seisanIdx].pts:0;
    const s3=HACHI_PTS(tayouCnt),s4=HACHI_PTS(shienCnt);
    const s5=chiikiOn?10:0,s6=keiei==="late"?-50:0,s7=chishikiOn?10:0;
    return{s1,s2,s3,s4,s5,s6,s7,total:s1+s2+s3+s4+s5+s6+s7};
  },[rodoIdx,seisanIdx,tayouCnt,shienCnt,chiikiOn,keiei,chishikiOn]);

  const calcIdx=scoreToIdx(calcScore.total);
  const selIdx=type==="A"?(aScoreMode==="calc"?calcIdx:aManualIdx):bIdx;
  const region=REGIONS[regIdx],up=region.rate;
  const baseTable=type==="A"?A_BASE:B_BASE;
  const idouTable=type==="A"?A_IDOU:B_IDOU;
  const staffOpts=type==="A"?["7.5:1","10:1"]:["6:1","7.5:1","10:1"];
  const shoryuList=type==="A"?A_SHORYU:B_SHORYU;
  const baseRate=baseTable[staffing]?.[cap]?.[selIdx]??0;
  const idouRate=idouTable[staffing]?.[cap]?.[selIdx]??0;

  const result=useMemo(()=>{
    const base=baseRate*users*days*up;
    const idouAmt=idouOn?idouRate*idouN*users*days*up:0;
    const cR=A_CHINGINKOJO[cap]??0;
    const cA=(type==="A"&&chinginOn)?cR*users*days*up:0;
    const mSR=B_MOKUHYO_SHIDOIN[cap]??0;
    const mSA=(type==="B"&&mokuhyoShidoinOn)?mSR*users*days*up:0;
    const mKA=(type==="B"&&mokuhyoKasanOn)?B_MOKUHYO_KASAN*users*days*up:0;
    let kasanTotal=0;const breakdown=[];
    KASAN.forEach(item=>{
      if(!kasanOn[item.id])return;
      const tgt=kasanTgt[item.id]??Math.round(users*0.5);
      const cnt=kasanCnt[item.id]??(item.defaultCount??1);
      const nw=kasanNew[item.id]??(item.defaultNew??1);
      let amt=0;
      if(item.type==="per_day")amt=item.unit*users*days*up;
      else if(item.type==="per_target_day")amt=item.unit*tgt*days*up;
      else if(item.type==="per_person_month")amt=item.unit*tgt*up;
      else if(item.type==="per_day_new")amt=item.unit*Math.min(days,30)*nw*up;
      else if(item.type==="fixed_count")amt=item.unit*cnt*up;
      kasanTotal+=amt;breakdown.push({...item,amt,tgt,cnt,nw});
    });
    const sub=base+idouAmt+cA+mSA+mKA+kasanTotal;
    const sR=shoryuList[shoryuIdx]?.rate??0;
    const sA=Math.floor(sub*sR/1000);
    return{base,idouAmt,chinginAmt:cA,chinginRate:cR,mokuhyoShidoinAmt:mSA,mokuhyoShidoinRate:mSR,
      mokuhyoKasanAmt:mKA,kasanTotal,breakdown,shoryuAmt:sA,shoryuRate:sR,subtotal:sub,total:sub+sA};
  },[type,baseRate,idouRate,idouOn,idouN,chinginOn,mokuhyoShidoinOn,mokuhyoKasanOn,
    users,days,up,cap,kasanOn,kasanTgt,kasanCnt,kasanNew,shoryuIdx,shoryuList]);

  const pl=useMemo(()=>{
    const homu=result.total;
    const nyukin=homu+seisanNyukin+sonotaNyukin;
    const staffSal=staff1N*staff1S+staff2N*staff2S;
    const fukori=Math.round(staffSal*fukoriRate/100);
    const koujin=kojinWage*users;
    const jinken=staffSal+fukori+koujin;
    const uneihi=yachin+konetsu+tsushin+shomohin+sharyo;
    const sonota=hoken+kenshu+itaku+genshokyaku+sonotaShishutsu;
    const shishutsu=jinken+uneihi+sonota;
    return{homu,seisanNyukin,sonotaNyukin,nyukin,staffSal,fukori,koujin,jinken,uneihi,sonota,shishutsu,eigyo:nyukin-shishutsu};
  },[result.total,seisanNyukin,sonotaNyukin,staff1N,staff1S,staff2N,staff2S,fukoriRate,kojinWage,users,
    yachin,konetsu,tsushin,shomohin,sharyo,hoken,kenshu,itaku,genshokyaku,sonotaShishutsu]);

  const isProfit=pl.eigyo>=0;

  // ── ヘッダー ──────────────────────────────────────────────────
  const Hdr=(
    <div style={{background:`linear-gradient(180deg,${C.card} 0%,${C.bg} 100%)`,padding:isMobile?"36px 20px 22px":"28px 40px 22px"}}>
      <div style={{maxWidth:1200,margin:"0 auto"}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10,fontSize:12,color:C.muted}}>
          <span onClick={()=>setPage("calc")} style={{cursor:"pointer",color:page==="pl"?C.muted:C.gold}}>報酬計算</span>
          {page==="pl"&&<><span>›</span><span style={{color:C.gold}}>月次PL試算</span></>}
        </div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12,flexWrap:"wrap",marginBottom:16}}>
          <div>
            <div style={{fontSize:10,color:C.muted,letterSpacing:3,marginBottom:4}}>令和6年度 障害福祉サービス報酬算定構造 準拠</div>
            <h1 style={{margin:0,fontSize:isMobile?18:22,fontWeight:700,color:C.text}}>
              {page==="calc"?"就労継続支援 報酬計算ツール":"月次収支試算（PL）"}
            </h1>
          </div>
          {page==="pl"&&(
            <button onClick={()=>setPage("calc")} style={{padding:"9px 18px",border:`1px solid ${C.border}`,borderRadius:9,background:C.card,color:C.gold,cursor:"pointer",fontFamily:"inherit",fontSize:13,fontWeight:600}}>
              ← 報酬計算に戻る
            </button>
          )}
        </div>
        {page==="calc"&&(
          <div style={{display:"flex",background:C.card2,borderRadius:14,padding:4,gap:4,maxWidth:420}}>
            {["A","B"].map(t=>(
              <button key={t} onClick={()=>switchType(t)} style={{flex:1,padding:"11px 8px",border:"none",borderRadius:11,cursor:"pointer",fontWeight:700,fontSize:14,fontFamily:"inherit",background:type===t?C.sel:"transparent",color:type===t?C.gold:C.muted}}>
                就労継続支援{t}型
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // ── PLページ ──────────────────────────────────────────────────
  if(page==="pl"){
    const bars=[
      {label:"人件費（職員）",val:pl.staffSal+pl.fukori,color:"#8b7440"},
      {label:"利用者工賃",val:pl.koujin,color:C.goldBr},
      {label:"事業運営費",val:pl.uneihi,color:"#4a7068"},
      {label:"その他経費",val:pl.sonota,color:"#5a4a68"},
    ];
    const PLLeft=(
      <div style={{flex:"1 1 0",minWidth:0}}>
        {/* 報酬連携バナー */}
        <div style={{background:C.card2,borderRadius:12,padding:"12px 16px",border:`1px solid ${C.selBdr}`,marginTop:isMobile?16:20,marginBottom:6}}>
          <div style={{fontSize:10,color:C.gold,letterSpacing:1.5,marginBottom:6}}>
            ◆ 報酬計算から自動反映 — {type==="A"?"A型":"B型"} / {REGIONS[regIdx].label}（{up}円）/ 通所{users}名 / {days}日
          </div>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:14,fontWeight:700}}>
            <span style={{color:C.muted}}>障害福祉サービス報酬</span>
            <span style={{color:C.goldBr}}>{fmtW(pl.homu)}</span>
          </div>
        </div>

        {/* 収入 */}
        <Sec label="収入の部">
          <PLIRow label="障害福祉サービス報酬" val={pl.homu} readOnly note="左記設定から自動反映"/>
          <PLIRow label="生産活動収入" val={seisanNyukin} set={setSeisanNyukin} note="商品・作業の売上など"/>
          <PLIRow label="その他収入" val={sonotaNyukin} set={setSonotaNyukin}/>
          <SubTotal label="収入合計" val={pl.nyukin} gold/>
        </Sec>

        {/* 人件費 */}
        <Sec label="支出の部 ① 人件費">
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
            <div><PLabel>正規職員 人数</PLabel><NInp val={staff1N} set={setStaff1N} max={50} unit="名"/></div>
            <div><PLabel>正規職員 平均月給</PLabel><NInp val={staff1S} set={setStaff1S} max={9999999} unit="円"/></div>
            <div><PLabel>非常勤職員 人数</PLabel><NInp val={staff2N} set={setStaff2N} max={50} unit="名"/></div>
            <div><PLabel>非常勤職員 平均月給</PLabel><NInp val={staff2S} set={setStaff2S} max={9999999} unit="円"/></div>
          </div>
          <SRow l={`職員給与（正規${staff1N}名 + 非常勤${staff2N}名）`} r={fmtW(pl.staffSal)}/>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
            <span style={{fontSize:12,color:C.muted,flex:1}}>法定福利費率</span>
            <input type="number" min={0} max={30} value={fukoriRate} onChange={e=>setFukoriRate(Number(e.target.value))}
              style={{width:52,...inp,textAlign:"center"}}/>
            <span style={{fontSize:12,color:C.muted}}>% →</span>
            <span style={{fontSize:12,color:C.dim}}>{fmtW(pl.fukori)}</span>
          </div>
          <PLIRow
            label={`利用者${type==="A"?"工賃（最低賃金以上）":"工賃"} 1人あたり月額`}
            val={kojinWage} set={setKojinWage}
            note={`${users}名 × ${fmtW(kojinWage)} = ${fmtW(pl.koujin)}`}/>
          <SubTotal label="人件費合計" val={pl.jinken}/>
        </Sec>

        {/* 事業運営費 */}
        <Sec label="支出の部 ② 事業運営費">
          <PLIRow label="家賃・地代" val={yachin} set={setYachin}/>
          <PLIRow label="水道光熱費" val={konetsu} set={setKonetsu}/>
          <PLIRow label="通信費" val={tsushin} set={setTsushin}/>
          <PLIRow label="消耗品・備品費" val={shomohin} set={setShomohin}/>
          <PLIRow label="車両費・燃料費" val={sharyo} set={setSharyo} note="送迎車両含む"/>
          <SubTotal label="事業運営費合計" val={pl.uneihi}/>
        </Sec>

        {/* その他経費 */}
        <Sec label="支出の部 ③ その他経費">
          <PLIRow label="保険料" val={hoken} set={setHoken}/>
          <PLIRow label="研修費" val={kenshu} set={setKenshu}/>
          <PLIRow label="システム・委託費" val={itaku} set={setItaku} note="請求ソフト等"/>
          <PLIRow label="減価償却費" val={genshokyaku} set={setGenshokyaku}/>
          <PLIRow label="その他経費" val={sonotaShishutsu} set={setSonotaShishutsu}/>
          <SubTotal label="その他経費合計" val={pl.sonota}/>
        </Sec>

        <div style={{marginTop:12,fontSize:11,color:C.dim,lineHeight:2,paddingBottom:40}}>
          ※ 本試算は概算です。実際の収支は利用率・工賃実績・減価償却方法等により異なります。<br/>
          ※ 法定福利費は職員給与合計に対する率で自動計算。利用者工賃は通所者数×入力月額で試算。
        </div>
      </div>
    );
    const PLRight=(
      <div style={{width:isMobile?"100%":340,flexShrink:0,...(isMobile?{}:{position:"sticky",top:20,alignSelf:"flex-start"})}}>
        {/* 営業損益メイン */}
        <div style={{borderRadius:14,overflow:"hidden",marginBottom:12,border:`2px solid ${isProfit?C.green:C.red}`}}>
          <div style={{padding:"18px 20px",background:isProfit?"rgba(74,222,128,0.07)":"rgba(248,113,113,0.07)"}}>
            <div style={{fontSize:10,letterSpacing:2.5,marginBottom:8,color:isProfit?C.green:C.red}}>
              {isProfit?"▲ 月次営業利益":"▼ 月次営業損失"}
            </div>
            <div style={{fontSize:34,fontWeight:700,letterSpacing:-1,color:isProfit?C.green:C.red}}>
              {isProfit?"+":""}{fmtW(pl.eigyo)}
            </div>
            <div style={{marginTop:10,fontSize:11,color:C.muted}}>年間換算（×12）</div>
            <div style={{fontSize:22,fontWeight:700,color:isProfit?C.green:C.red}}>
              {isProfit?"+":""}{fmtW(pl.eigyo*12)}
            </div>
          </div>
        </div>

        {/* 収支サマリー */}
        <div style={{background:C.card2,borderRadius:12,padding:"14px 16px",border:`1px solid ${C.border}`,marginBottom:12}}>
          <div style={{fontSize:11,color:C.muted,marginBottom:10}}>収支サマリー</div>
          <div style={{marginBottom:10}}>
            <div style={{fontSize:10,color:C.gold,marginBottom:4}}>■ 収入</div>
            <SRow l="　障害福祉サービス報酬" r={fmtW(pl.homu)} gold/>
            {pl.seisanNyukin>0&&<SRow l="　生産活動収入" r={fmtW(pl.seisanNyukin)}/>}
            {pl.sonotaNyukin>0&&<SRow l="　その他収入" r={fmtW(pl.sonotaNyukin)}/>}
            <div style={{borderTop:`1px solid ${C.border}`,marginTop:5,paddingTop:5}}>
              <SRow l="収入合計" r={fmtW(pl.nyukin)} bold gold/>
            </div>
          </div>
          <div style={{marginBottom:10}}>
            <div style={{fontSize:10,color:C.muted,marginBottom:4}}>■ 支出</div>
            <SRow l="　職員給与" r={fmtW(pl.staffSal)}/>
            <SRow l="　法定福利費" r={fmtW(pl.fukori)}/>
            <SRow l={`　利用者工賃（${users}名）`} r={fmtW(pl.koujin)}/>
            <SRow l="　事業運営費" r={fmtW(pl.uneihi)}/>
            <SRow l="　その他経費" r={fmtW(pl.sonota)}/>
            <div style={{borderTop:`1px solid ${C.border}`,marginTop:5,paddingTop:5}}>
              <SRow l="支出合計" r={fmtW(pl.shishutsu)} bold/>
            </div>
          </div>
          <div style={{borderTop:`2px solid ${C.border}`,paddingTop:8}}>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:14,fontWeight:700}}>
              <span style={{color:C.text}}>営業損益</span>
              <span style={{color:isProfit?C.green:C.red}}>{isProfit?"+":""}{fmtW(pl.eigyo)}</span>
            </div>
          </div>
        </div>

        {/* 支出構成バー */}
        <div style={{background:C.card2,borderRadius:12,padding:"14px 16px",border:`1px solid ${C.border}`}}>
          <div style={{fontSize:11,color:C.muted,marginBottom:10}}>支出構成</div>
          {bars.map(b=>{
            const pct=pl.shishutsu>0?Math.round(b.val/pl.shishutsu*100):0;
            return(
              <div key={b.label} style={{marginBottom:8}}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:3}}>
                  <span style={{color:C.muted}}>{b.label}</span>
                  <span style={{color:C.dim}}>{pct}%　{fmtW(b.val)}</span>
                </div>
                <div style={{height:5,borderRadius:3,background:C.border}}>
                  <div style={{height:"100%",borderRadius:3,width:`${pct}%`,background:b.color,transition:"width 0.4s"}}/>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
    return(
      <div style={{fontFamily:"'Hiragino Kaku Gothic ProN','Noto Sans JP','BIZ UDPGothic',sans-serif",background:C.bg,color:C.text,minHeight:"100vh"}}>
        {Hdr}
        <div style={{maxWidth:1200,margin:"0 auto",padding:isMobile?"0 16px":"0 40px",display:isMobile?"block":"flex",gap:32,alignItems:"flex-start"}}>
          {isMobile?<>{PLLeft}{PLRight}</>:<>{PLLeft}<div style={{marginTop:20}}>{PLRight}</div></>}
        </div>
      </div>
    );
  }

  // ── 報酬計算ページ ────────────────────────────────────────────
  const ScorePanel=(
    <div>
      <div style={{display:"flex",gap:6,marginBottom:18}}>
        {[["calc","スコアから自動計算"],["manual","評価点を直接選択"]].map(([m,lb])=>(
          <button key={m} onClick={()=>setAScoreMode(m)} style={{flex:1,padding:"9px 8px",border:"1px solid",borderRadius:9,cursor:"pointer",fontSize:13,fontFamily:"inherit",fontWeight:aScoreMode===m?700:400,borderColor:aScoreMode===m?C.selBdr:C.border,background:aScoreMode===m?C.sel:C.card,color:aScoreMode===m?C.gold:C.muted}}>{lb}</button>
        ))}
      </div>
      {aScoreMode==="calc"?(
        <>
          <div style={{background:C.card2,borderRadius:12,padding:"14px 16px",border:`1px solid ${C.border}`,marginBottom:20}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <span style={{fontSize:12,color:C.muted}}>合計スコア</span>
              <span style={{fontSize:26,fontWeight:700,color:calcScore.total>=170?C.green:calcScore.total>=105?C.goldBr:calcScore.total>=60?C.gold:C.red}}>
                {calcScore.total}<span style={{fontSize:13,fontWeight:400,color:C.muted}}> / 200点</span>
              </span>
            </div>
            <div style={{height:8,borderRadius:4,background:C.border,overflow:"hidden",marginBottom:8}}>
              <div style={{height:"100%",borderRadius:4,transition:"width 0.4s",width:`${Math.max(0,Math.min(100,(calcScore.total+50)/250*100))}%`,background:calcScore.total>=170?C.green:calcScore.total>=105?C.goldBr:calcScore.total>=60?C.gold:C.red}}/>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:C.dim}}><span>-50</span><span>0</span><span>60</span><span>105</span><span>150</span><span>170</span><span>200</span></div>
            <div style={{marginTop:12,display:"grid",gridTemplateColumns:"1fr 1fr",gap:"4px 16px",fontSize:11}}>
              {[["（Ⅰ）労働時間",calcScore.s1],["（Ⅱ）生産活動",calcScore.s2],[`（Ⅲ）多様な働き方（${tayouCnt}/8）`,calcScore.s3],[`（Ⅳ）支援力向上（${shienCnt}/8）`,calcScore.s4],["（Ⅴ）地域連携活動",calcScore.s5],["（Ⅵ）経営改善計画",calcScore.s6],["（Ⅶ）知識・能力向上",calcScore.s7]].map(([lb,pt])=>(
                <div key={lb} style={{display:"flex",justifyContent:"space-between"}}><span style={{color:C.dim}}>{lb}</span><span style={{fontWeight:600,color:pt>0?C.gold:pt<0?C.red:C.dim}}>{pt>0?"+":""}{pt}点</span></div>
              ))}
            </div>
            <div style={{marginTop:12,padding:"8px 12px",borderRadius:8,background:C.sel,border:`1px solid ${C.selBdr}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontSize:12,color:C.gold}}>評価点区分</span>
              <span style={{fontSize:14,fontWeight:700,color:C.goldBr}}>{A_SCORE_LABELS[calcIdx]}</span>
            </div>
          </div>
          {[
            {lbl:"（Ⅰ）労働時間",sc:calcScore.s1,nt:"8区分から1つ選択",ch:A_RODO.map((r,i)=><RRow key={i} on={rodoIdx===i} click={()=>setRodoIdx(i)} label={r.label} pts={r.pts}/>)},
            {lbl:"（Ⅱ）生産活動",sc:calcScore.s2,nt:"6区分から1つ選択",ch:A_SEISAN.map((s,i)=><RRow key={i} on={seisanIdx===i} click={()=>setSeisanIdx(i)} label={s.label} pts={s.pts}/>)},
            {lbl:"（Ⅲ）多様な働き方",sc:calcScore.s3,nt:`${tayouCnt}項目 → ${tayouCnt>=5?"15点":tayouCnt>=3?"5点":"0点"}（5以上:15点 / 4〜3:5点 / 2以下:0点）`,ch:A_TAYOU.map((lb,i)=><CRow key={i} on={!!tayouChecks[i]} chg={()=>setTayouChecks(p=>({...p,[i]:!p[i]}))} label={lb}/>)},
            {lbl:"（Ⅳ）支援力向上",sc:calcScore.s4,nt:`${shienCnt}項目 → ${shienCnt>=5?"15点":shienCnt>=3?"5点":"0点"}（5以上:15点 / 4〜3:5点 / 2以下:0点）`,ch:A_SHIEN.map((lb,i)=><CRow key={i} on={!!shienChecks[i]} chg={()=>setShienChecks(p=>({...p,[i]:!p[i]}))} label={lb}/>)},
            {lbl:"（Ⅴ）地域連携活動",sc:calcScore.s5,nt:"1事例以上で10点",ch:<CRow on={chiikiOn} chg={()=>setChiikiOn(v=>!v)} label="地域の事業者と連携した活動を行い、結果をインターネット等により公表している"/>},
            {lbl:"（Ⅵ）経営改善計画",sc:calcScore.s6,nt:"期限内未提出で-50点",ch:[["safe","提出を求められていない、または期日までに提出している"],["late","指定された期日までに提出していない → -50点"]].map(([v,lb])=><RRow key={v} on={keiei===v} click={()=>setKeiei(v)} label={lb} pts={v==="late"?-50:0}/>)},
            {lbl:"（Ⅶ）利用者の知識・能力向上",sc:calcScore.s7,nt:"1事例以上で10点",ch:<CRow on={chishikiOn} chg={()=>setChishikiOn(v=>!v)} label="前年度において知識・能力向上に向けた支援の報告書を作成し、インターネット等により公表している"/>},
          ].map(s=>(
            <SSec key={s.lbl} label={s.lbl} score={s.sc} note={s.nt}>{s.ch}</SSec>
          ))}
        </>
      ):(
        <div style={{display:"flex",flexDirection:"column",gap:6}}>
          {A_SCORE_LABELS.map((lb,i)=>{const rate=baseTable[staffing]?.[cap]?.[i];const on=aManualIdx===i;return(
            <button key={i} onClick={()=>setAManualIdx(i)} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"13px 16px",borderRadius:10,cursor:"pointer",fontFamily:"inherit",border:`1px solid ${on?C.selBdr:C.border}`,background:on?C.sel:C.card,color:on?C.gold:C.text}}>
              <span style={{fontSize:13}}>{lb}</span><span style={{fontSize:13,fontWeight:700,color:on?C.goldBr:C.muted}}>{rate?.toLocaleString()} 単位</span>
            </button>
          );})}
        </div>
      )}
    </div>
  );

  const InPanel=(
    <div style={{flex:"1 1 0",minWidth:0}}>
      {type==="B"&&(<><Div label="平均工賃月額区分（基本報酬）"/>
        <div style={{display:"flex",flexDirection:"column",gap:6}}>
          {B_WAGE_LABELS.map((lb,i)=>{const rate=B_BASE[staffing]?.[cap]?.[i];const on=bIdx===i;return(
            <button key={i} onClick={()=>setBIdx(i)} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"13px 16px",borderRadius:10,cursor:"pointer",fontFamily:"inherit",border:`1px solid ${on?C.selBdr:C.border}`,background:on?C.sel:C.card,color:on?C.gold:C.text}}>
              <span style={{fontSize:13}}>{lb}</span><span style={{fontSize:13,fontWeight:700,color:on?C.goldBr:C.muted}}>{rate?.toLocaleString()} 単位</span>
            </button>
          );})}
        </div>
      </>)}
      {type==="A"&&(<><Div label="A型 評価スコア・基本報酬区分（様式2-1）"/>{ScorePanel}</>)}
      <Div label="事業所設定"/>
      <div style={{marginBottom:14}}>
        <Lbl>職員配置比</Lbl>
        <div style={{display:"flex",gap:6}}>{staffOpts.map(s=>{const on=staffing===s;return(<button key={s} onClick={()=>setStaffing(s)} style={{flex:1,padding:"9px 4px",border:"1px solid",borderRadius:9,cursor:"pointer",fontSize:14,fontWeight:on?700:400,fontFamily:"inherit",borderColor:on?C.selBdr:C.border,background:on?C.sel:C.card,color:on?C.gold:C.muted}}>{s}</button>);})}</div>
      </div>
      <div style={{marginBottom:14}}>
        <Lbl>利用定員区分</Lbl>
        <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>{CAP_LABELS.map((lb,i)=>{const k=CAP_KEYS[i];const on=cap===k;return(<button key={k} onClick={()=>setCap(k)} style={{padding:"7px 11px",border:"1px solid",borderRadius:8,cursor:"pointer",fontSize:12,fontFamily:"inherit",fontWeight:on?700:400,borderColor:on?C.selBdr:C.border,background:on?C.sel:C.card,color:on?C.gold:C.muted}}>{lb}</button>);})}</div>
      </div>
      <div>
        <Lbl>地域単価（A型・B型共通 令和6年度）</Lbl>
        <div style={{position:"relative"}}>
          <select value={regIdx} onChange={e=>setRegIdx(Number(e.target.value))} style={{width:"100%",background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:"13px 40px 13px 14px",color:C.text,fontSize:14,fontFamily:"inherit",appearance:"none",outline:"none",cursor:"pointer"}}>
            {REGIONS.map((r,i)=><option key={i} value={i} style={{background:C.card2}}>{r.label}　{r.rate}円 ／ {r.ex}</option>)}
          </select>
          <span style={{position:"absolute",right:13,top:"50%",transform:"translateY(-50%)",color:C.muted,pointerEvents:"none",fontSize:18}}>⌄</span>
        </div>
      </div>
      <Div label="入力値"/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <NF label="通所者数（人/日）" val={users} set={setUsers} max={500}/>
        <NF label="月稼働日数（日）"  val={days}  set={setDays}  max={31}/>
      </div>
      <Div label="加算設定"/>
      <KRow on={idouOn} toggle={()=>setIdouOn(v=>!v)} title="就労移行支援体制加算" sub={`${idouRate}単位/日`} note="前年度就労定着者 1名以上">
        {idouOn&&<IInp label="就労定着者数" val={idouN} set={setIdouN} max={99} unit="名"/>}
      </KRow>
      {type==="A"&&<KRow on={chinginOn} toggle={()=>setChinginOn(v=>!v)} title="賃金向上達成指導員配置加算" sub={`${result.chinginRate}単位/日（${CAP_LABELS[CAP_KEYS.indexOf(cap)]}）`} note="賃金向上計画を策定・実施する場合"/>}
      {type==="B"&&<>
        <KRow on={mokuhyoShidoinOn} toggle={()=>setMokuhyoShidoinOn(v=>!v)} title="目標工賃達成指導員配置等加算" sub={`${result.mokuhyoShidoinRate}単位/日`} note="工賃向上計画を策定・実施する場合"/>
        <KRow on={mokuhyoKasanOn} toggle={()=>setMokuhyoKasanOn(v=>!v)} title="目標工賃達成加算" sub={`${B_MOKUHYO_KASAN}単位/日`} note="前年度の平均工賃月額が目標値を達成した場合"/>
      </>}
      <button onClick={()=>setShowKasan(v=>!v)} style={{width:"100%",background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:"12px 16px",color:showKasan?C.gold:C.text,cursor:"pointer",fontFamily:"inherit",fontSize:14,display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:showKasan?8:0,fontWeight:showKasan?600:400,marginTop:6}}>
        <span>その他加算項目</span><span style={{color:C.muted,fontSize:18,lineHeight:1}}>{showKasan?"−":"+"}</span>
      </button>
      {showKasan&&KASAN.map(item=>{
        const on=!!kasanOn[item.id];
        const tgt=kasanTgt[item.id]??Math.round(users*0.5);
        const cnt=kasanCnt[item.id]??(item.defaultCount??1);
        const nw=kasanNew[item.id]??(item.defaultNew??1);
        return(<KRow key={item.id} on={on} toggle={()=>setKasanOn(p=>({...p,[item.id]:!p[item.id]}))} title={item.label} sub={`${item.unit}単位/${item.type==="per_person_month"?"月・人":item.type==="fixed_count"?"回":"日"}`} note={item.note}>
          {on&&item.type==="per_target_day"&&<IInp label="対象者" val={tgt} unit="名" set={v=>setKasanTgt(p=>({...p,[item.id]:v}))} max={200}/>}
          {on&&item.type==="per_person_month"&&<IInp label="対象者" val={tgt} unit="名" set={v=>setKasanTgt(p=>({...p,[item.id]:v}))} max={200}/>}
          {on&&item.type==="fixed_count"&&<IInp label="月間回数" val={cnt} unit="回" set={v=>setKasanCnt(p=>({...p,[item.id]:v}))} max={10}/>}
          {on&&item.type==="per_day_new"&&<IInp label="新規利用者" val={nw} unit="名" set={v=>setKasanNew(p=>({...p,[item.id]:v}))} max={50}/>}
        </KRow>);
      })}
      <Div label="福祉・介護職員等処遇改善加算"/>
      <div style={{background:C.card,borderRadius:12,padding:16,border:`1px solid ${C.border}`}}>
        <div style={{fontSize:11,color:C.muted,marginBottom:10}}>区分（{type==="A"?"A型":"B型"}）※加算前合計に乗算</div>
        <div style={{display:"flex",flexDirection:"column",gap:5}}>
          {shoryuList.map((s,i)=>{const on=shoryuIdx===i;return(<button key={i} onClick={()=>setShoryuIdx(i)} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 14px",borderRadius:9,cursor:"pointer",fontFamily:"inherit",border:`1px solid ${on?C.selBdr:C.border}`,background:on?C.sel:C.card2,color:on?C.gold:C.text}}>
            <span style={{fontSize:13}}>{s.rate===0?"算定しない":`処遇改善加算 ${s.label}`}</span>
            {s.rate>0&&<span style={{fontSize:12,color:on?C.goldBr:C.muted}}>×{s.rate}‰</span>}
          </button>);})}
        </div>
        {shoryuIdx>0&&<div style={{marginTop:10,fontSize:11,color:C.dim}}>算定基礎: {fmtW(result.subtotal)} × {result.shoryuRate}/1,000 = <span style={{color:C.gold}}>{fmtW(result.shoryuAmt)}</span></div>}
      </div>
      <div style={{marginTop:20,fontSize:11,color:C.dim,lineHeight:2,paddingBottom:20}}>
        ※ 厚生労働省「障害福祉サービス費等の報酬算定構造」（令和6年度版）p.24-29 準拠。A型スコア計算は様式2-1に基づく。
      </div>
    </div>
  );

  const ResPanel=(
    <div style={{width:isMobile?"100%":340,flexShrink:0,...(isMobile?{}:{position:"sticky",top:20,alignSelf:"flex-start"})}}>
      <div style={{background:C.card2,borderRadius:12,padding:"14px 16px",border:`1px solid ${C.border}`,marginBottom:12}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
          <span style={{fontSize:11,color:C.muted}}>基本報酬単価</span>
          <span style={{fontSize:19,fontWeight:700,color:C.goldBr}}>{baseRate.toLocaleString()} <span style={{fontSize:12,fontWeight:400}}>単位/日</span></span>
        </div>
        {type==="A"&&aScoreMode==="calc"&&(
          <div style={{marginBottom:8,padding:"6px 10px",borderRadius:7,background:C.sel,border:`1px solid ${C.selBdr}`,display:"flex",justifyContent:"space-between",fontSize:11}}>
            <span style={{color:C.gold}}>スコア合計 {calcScore.total}点</span>
            <span style={{color:C.goldBr,fontWeight:600}}>{A_SCORE_LABELS[calcIdx]}</span>
          </div>
        )}
        <SRow l={`${baseRate}単位 × ${up}円 × ${users}名 × ${days}日`} r={fmtW(result.base)}/>
      </div>
      {(idouOn||chinginOn||mokuhyoShidoinOn||mokuhyoKasanOn||result.breakdown.length>0||shoryuIdx>0)&&(
        <div style={{background:C.card2,borderRadius:12,padding:"12px 16px",border:`1px solid ${C.border}`,marginBottom:12}}>
          <div style={{fontSize:11,color:C.muted,marginBottom:8}}>加算内訳</div>
          {idouOn&&<SRow l={`就労移行体制加算（${idouRate}×${idouN}人）`} r={fmtW(result.idouAmt)} gold/>}
          {type==="A"&&chinginOn&&<SRow l="賃金向上達成指導員" r={fmtW(result.chinginAmt)} gold/>}
          {type==="B"&&mokuhyoShidoinOn&&<SRow l="目標工賃達成指導員" r={fmtW(result.mokuhyoShidoinAmt)} gold/>}
          {type==="B"&&mokuhyoKasanOn&&<SRow l="目標工賃達成加算" r={fmtW(result.mokuhyoKasanAmt)} gold/>}
          {result.breakdown.map(item=><SRow key={item.id} l={item.label} r={fmtW(item.amt)} gold/>)}
          {shoryuIdx>0&&<SRow l={`処遇改善加算 ${shoryuList[shoryuIdx]?.label}`} r={fmtW(result.shoryuAmt)} gold/>}
        </div>
      )}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
        <div style={{background:C.card,borderRadius:14,padding:"18px 14px",border:`1px solid ${C.border}`}}>
          <div style={{fontSize:10,color:C.muted,letterSpacing:2,marginBottom:8}}>MONTHLY</div>
          <div style={{fontSize:isMobile?24:20,fontWeight:700,color:C.text,wordBreak:"break-all"}}>{fmt(result.total)}</div>
          <div style={{fontSize:12,color:C.muted,marginTop:4}}>円</div>
        </div>
        <div style={{background:C.sel,borderRadius:14,padding:"18px 14px",border:`1px solid ${C.selBdr}`}}>
          <div style={{fontSize:10,color:C.gold,letterSpacing:2,marginBottom:8}}>ANNUAL × 12</div>
          <div style={{fontSize:isMobile?24:20,fontWeight:700,color:C.goldBr,wordBreak:"break-all"}}>{fmt(result.total*12)}</div>
          <div style={{fontSize:12,color:C.gold,marginTop:4}}>円</div>
        </div>
      </div>
      <div style={{background:C.card2,borderRadius:12,padding:"12px 16px",border:`1px solid ${C.border}`,marginBottom:16}}>
        <SRow l="基本報酬" r={fmtW(result.base)}/>
        {idouOn&&<SRow l="就労移行体制加算" r={fmtW(result.idouAmt)}/>}
        {type==="A"&&chinginOn&&<SRow l="賃金向上達成指導員" r={fmtW(result.chinginAmt)}/>}
        {type==="B"&&mokuhyoShidoinOn&&<SRow l="目標工賃達成指導員" r={fmtW(result.mokuhyoShidoinAmt)}/>}
        {type==="B"&&mokuhyoKasanOn&&<SRow l="目標工賃達成加算" r={fmtW(result.mokuhyoKasanAmt)}/>}
        {result.kasanTotal>0&&<SRow l="その他加算" r={fmtW(result.kasanTotal)}/>}
        {shoryuIdx>0&&<SRow l="処遇改善加算" r={fmtW(result.shoryuAmt)}/>}
        <div style={{borderTop:`1px solid ${C.border}`,marginTop:8,paddingTop:8}}>
          <SRow l="合計" r={fmtW(result.total)} bold gold/>
        </div>
      </div>
      {/* PLへ */}
      <button onClick={()=>setPage("pl")} style={{width:"100%",padding:"15px 16px",borderRadius:12,border:"none",background:`linear-gradient(135deg,${C.selBdr} 0%,${C.goldBr} 100%)`,color:C.bg,fontWeight:700,fontSize:15,fontFamily:"inherit",cursor:"pointer",boxShadow:"0 4px 20px rgba(197,155,100,0.3)"}}>
        月次PL試算へ →
      </button>
    </div>
  );

  return(
    <div style={{fontFamily:"'Hiragino Kaku Gothic ProN','Noto Sans JP','BIZ UDPGothic',sans-serif",background:C.bg,color:C.text,minHeight:"100vh"}}>
      {Hdr}
      <div style={{maxWidth:1200,margin:"0 auto",padding:isMobile?"0 16px":"0 40px",display:isMobile?"block":"flex",gap:32,alignItems:"flex-start"}}>
        {isMobile?<><div style={{marginTop:16}}>{ResPanel}</div>{InPanel}</>:<>{InPanel}<div style={{marginTop:20}}>{ResPanel}</div></>}
      </div>
    </div>
  );
}

// ── コンポーネント群 ──────────────────────────────────────────────

function Sec({label,children}){
  return(
    <div style={{marginBottom:16}}>
      <div style={{fontSize:11,color:C.gold,letterSpacing:1.5,marginBottom:10,paddingBottom:6,borderBottom:`1px solid ${C.border}`}}>{label}</div>
      {children}
    </div>
  );
}
function PLIRow({label,val,set,readOnly,note}){
  return(
    <div style={{marginBottom:8}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:8}}>
        <div style={{flex:1}}>
          <div style={{fontSize:12,color:readOnly?C.gold:C.text,marginBottom:note?2:0}}>{label}</div>
          {note&&<div style={{fontSize:10,color:C.dim}}>{note}</div>}
        </div>
        {readOnly
          ?<div style={{fontSize:14,fontWeight:700,color:C.goldBr,textAlign:"right",minWidth:120}}>{fmtW(val)}</div>
          :<div style={{display:"flex",alignItems:"center",gap:4,minWidth:140}}>
            <span style={{fontSize:12,color:C.muted}}>¥</span>
            <input type="number" min={0} value={val} onChange={e=>set(Math.max(0,Number(e.target.value)))} style={{...inp}}/>
          </div>
        }
      </div>
    </div>
  );
}
function SubTotal({label,val,gold}){
  return(
    <div style={{borderTop:`1px solid ${C.border}`,marginTop:10,paddingTop:10,display:"flex",justifyContent:"space-between",fontSize:13,fontWeight:700}}>
      <span style={{color:C.text}}>{label}</span>
      <span style={{color:gold?C.gold:C.goldBr}}>{fmtW(val)}</span>
    </div>
  );
}
function PLabel({children}){return <div style={{fontSize:11,color:C.muted,marginBottom:5}}>{children}</div>;}
function NInp({val,set,max,unit}){
  return(
    <div style={{display:"flex",alignItems:"center",gap:4}}>
      <input type="number" min={0} max={max} value={val} onChange={e=>set(Math.max(0,Number(e.target.value)))} style={{...inp}}/>
      <span style={{fontSize:11,color:C.muted,flexShrink:0}}>{unit}</span>
    </div>
  );
}
function SRow({l,r,bold,gold}){
  return(
    <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:4}}>
      <span style={{color:bold?C.text:C.dim,fontWeight:bold?600:400}}>{l}</span>
      <span style={{fontWeight:bold?700:500,color:gold?C.gold:bold?C.goldBr:C.muted,whiteSpace:"nowrap"}}>{r}</span>
    </div>
  );
}
function SSec({label,score,note,children}){
  return(
    <div style={{marginBottom:16,background:C.card,borderRadius:12,overflow:"hidden",border:`1px solid ${C.border}`}}>
      <div style={{padding:"11px 14px",borderBottom:`1px solid ${C.border}`,background:C.card2,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div><span style={{fontSize:13,fontWeight:700,color:C.text}}>{label}</span>{note&&<div style={{fontSize:10,color:C.muted,marginTop:2}}>{note}</div>}</div>
        <span style={{fontSize:16,fontWeight:700,color:score>0?C.gold:score<0?C.red:C.dim,minWidth:48,textAlign:"right"}}>{score>0?"+":""}{score}点</span>
      </div>
      <div style={{padding:"8px 10px",display:"flex",flexDirection:"column",gap:4}}>{children}</div>
    </div>
  );
}
function RRow({on,click,label,pts}){
  return(
    <div onClick={click} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 12px",borderRadius:8,cursor:"pointer",background:on?C.sel:"transparent",border:`1px solid ${on?C.selBdr:"transparent"}`,transition:"all 0.12s"}}>
      <div style={{display:"flex",alignItems:"center",gap:8,flex:1}}>
        <div style={{width:16,height:16,borderRadius:"50%",flexShrink:0,border:`2px solid ${on?C.gold:C.border}`,background:on?C.gold:"transparent",display:"flex",alignItems:"center",justifyContent:"center"}}>
          {on&&<div style={{width:6,height:6,borderRadius:"50%",background:C.bg}}/>}
        </div>
        <span style={{fontSize:12,color:on?C.text:C.muted,lineHeight:1.4}}>{label}</span>
      </div>
      <span style={{fontSize:12,fontWeight:700,marginLeft:8,whiteSpace:"nowrap",color:pts>0?C.gold:pts<0?C.red:C.muted}}>{pts>0?"+":""}{pts}点</span>
    </div>
  );
}
function CRow({on,chg,label}){
  return(
    <div onClick={chg} style={{display:"flex",alignItems:"flex-start",gap:8,padding:"9px 12px",borderRadius:8,cursor:"pointer",background:on?C.sel:"transparent",border:`1px solid ${on?C.selBdr:"transparent"}`,transition:"all 0.12s"}}>
      <div style={{width:16,height:16,borderRadius:4,flexShrink:0,marginTop:1,border:`1.5px solid ${on?C.gold:C.border}`,background:on?C.gold:"transparent",display:"flex",alignItems:"center",justifyContent:"center"}}>
        {on&&<span style={{fontSize:10,color:C.bg,fontWeight:700,lineHeight:1}}>✓</span>}
      </div>
      <span style={{fontSize:12,color:on?C.text:C.muted,lineHeight:1.5}}>{label}</span>
    </div>
  );
}
function Lbl({children}){return <div style={{fontSize:11,color:C.muted,marginBottom:8}}>{children}</div>;}
function CB({checked,onChange}){
  return(
    <div onClick={onChange} style={{width:20,height:20,borderRadius:5,flexShrink:0,marginTop:1,border:`1px solid ${checked?C.gold:C.border}`,background:checked?C.gold:"transparent",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
      {checked&&<span style={{fontSize:12,color:C.bg,fontWeight:700}}>✓</span>}
    </div>
  );
}
function KRow({on,toggle,title,sub,note,children}){
  return(
    <div style={{marginBottom:8,borderRadius:11,overflow:"hidden",border:`1px solid ${on?C.selBdr:C.border}`,background:on?C.sel:C.card,transition:"all 0.15s"}}>
      <label style={{display:"flex",alignItems:"flex-start",gap:10,padding:"11px 13px",cursor:"pointer"}}>
        <CB checked={on} onChange={toggle}/>
        <div style={{flex:1}}>
          <div style={{fontSize:13,fontWeight:on?600:400,color:on?C.gold:C.text,lineHeight:1.4}}>{title}{sub&&<span style={{fontSize:11,fontWeight:400,color:C.muted,marginLeft:6}}>{sub}</span>}</div>
          {note&&<div style={{fontSize:11,color:C.muted,marginTop:1}}>{note}</div>}
        </div>
      </label>
      {children&&<div style={{paddingBottom:10}}>{children}</div>}
    </div>
  );
}
function IInp({label,val,set,max,unit}){
  return(
    <div style={{padding:"0 13px 0 43px",display:"flex",alignItems:"center",gap:8}}>
      <span style={{fontSize:12,color:C.muted}}>{label}:</span>
      <input type="number" min={0} max={max} value={val} onChange={e=>set(Number(e.target.value))}
        style={{width:64,background:C.card2,border:`1px solid ${C.border}`,borderRadius:7,padding:"5px 8px",color:C.text,fontSize:15,fontWeight:700,fontFamily:"inherit",textAlign:"center",outline:"none"}}/>
      <span style={{fontSize:12,color:C.muted}}>{unit}</span>
    </div>
  );
}
function Div({label}){
  return(
    <div style={{display:"flex",alignItems:"center",gap:12,margin:"26px 0 14px"}}>
      <div style={{flex:1,height:1,background:C.border}}/>
      <span style={{fontSize:11,color:C.muted,letterSpacing:2,whiteSpace:"nowrap"}}>{label}</span>
      <div style={{flex:1,height:1,background:C.border}}/>
    </div>
  );
}
function NF({label,val,set,max}){
  return(
    <div>
      <div style={{fontSize:11,color:C.muted,marginBottom:7}}>{label}</div>
      <input type="number" value={val} min={1} max={max} onChange={e=>set(Math.min(max,Math.max(1,Number(e.target.value))))}
        style={{width:"100%",boxSizing:"border-box",background:C.card2,border:`1px solid ${C.border}`,borderRadius:11,padding:"13px 8px",fontSize:22,fontWeight:700,color:C.text,textAlign:"center",outline:"none",fontFamily:"inherit"}}/>
    </div>
  );
}
