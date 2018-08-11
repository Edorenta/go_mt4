#property copyright "Paul de Renty"
#property link      ""
#property version   "1.00"
#property strict

#define URI         "127.0.0.1"

#define AUDCAD_PORT 21001
#define AUDCHF_PORT 21002
#define AUDJPY_PORT 21003
#define AUDNZD_PORT 21004
#define AUDSGD_PORT 21005
#define AUDUSD_PORT 21006
#define CADCHF_PORT 21007
#define CADJPY_PORT 21008
#define CHFJPY_PORT 21009
#define CHFSGD_PORT 21010
#define EURAUD_PORT 21011
#define EURCAD_PORT 21012
#define EURCHF_PORT 21013
#define EURCZK_PORT 21014
#define EURGBP_PORT 21015
#define EURHUF_PORT 21016
#define EURJPY_PORT 21017
#define EURMXN_PORT 21018
#define EURNOK_PORT 21019
#define EURNZD_PORT 21020
#define EURPLN_PORT 21021
#define EURSEK_PORT 21022
#define EURSGD_PORT 21023
#define EURTRY_PORT 21024
#define EURUSD_PORT 21025
#define EURZAR_PORT 21026
#define GBPAUD_PORT 21027
#define GBPCAD_PORT 21028
#define GBPCHF_PORT 21029
#define GBPJPY_PORT 21030
#define GBPMXN_PORT 21031
#define GBPNOK_PORT 21032
#define GBPNZD_PORT 21033
#define GBPSEK_PORT 21034
#define GBPSGD_PORT 21035
#define GBPTRY_PORT 21036
#define GBPUSD_PORT 21037
#define NOKJPY_PORT 21038
#define NOKSEK_PORT 21039
#define NZDCAD_PORT 21040
#define NZDCHF_PORT 21041
#define NZDJPY_PORT 21042
#define NZDUSD_PORT 21043
#define SEKJPY_PORT 21044
#define SGDJPY_PORT 21045
#define USDCAD_PORT 21046
#define USDCHF_PORT 21047
#define USDCNH_PORT 21048
#define USDCZK_PORT 21049
#define USDHKD_PORT 21050
#define USDHUF_PORT 21051
#define USDJPY_PORT 21052
#define USDMXN_PORT 21053
#define USDNOK_PORT 21054
#define USDPLN_PORT 21055
#define USDRUB_PORT 21056
#define USDSEK_PORT 21057
#define USDSGD_PORT 21058
#define USDTHB_PORT 21059
#define USDTRY_PORT 21060
#define USDZAR_PORT 21061
#define ZARJPY_PORT 21062

#define BTCUSD_PORT 22001
#define BCHUSD_PORT 22002
#define DSHUSD_PORT 22003
#define ETHUSD_PORT 22004
#define LTCUSD_PORT 22005

#define XAOAUD_PORT 23001
#define XINCNY_PORT 23002
#define ESXEUR_PORT 23003
#define PX1EUR_PORT 23004
#define DAXEUR_PORT 23005
#define HSIHKD_PORT 23006
#define MIBEUR_PORT 23007
#define NIKJPY_PORT 23008
#define NDXUSD_PORT 23009
#define IBXEUR_PORT 23010
#define UKXGBP_PORT 23011
#define RUTUSD_PORT 23012
#define DJIUSD_PORT 23013
#define USXUSD_PORT 23014

#define XAGEUR_PORT 24001
#define XAGUSD_PORT 24002
#define XAUAUD_PORT 24003
#define XAUEUR_PORT 24004
#define XAUUSD_PORT 24005
#define XBRUSD_PORT 24006
#define XNGUSD_PORT 24007
#define XPDUSD_PORT 24008
#define XPTUSD_PORT 24009
#define XTIUSD_PORT 24010

ushort		get_feed_port(string symbol) {
	if 		(StringFind(symbol,"AUDCAD",0)) { return AUDCAD_PORT; }
	else if (StringFind(symbol,"AUDCHF",0)) { return AUDCHF_PORT; }
	else if (StringFind(symbol,"AUDJPY",0)) { return AUDJPY_PORT; }
	else if (StringFind(symbol,"AUDNZD",0)) { return AUDNZD_PORT; }
	else if (StringFind(symbol,"AUDSGD",0)) { return AUDSGD_PORT; }
	else if (StringFind(symbol,"AUDUSD",0)) { return AUDUSD_PORT; }
	else if (StringFind(symbol,"CADCHF",0)) { return CADCHF_PORT; }
	else if (StringFind(symbol,"CADJPY",0)) { return CADJPY_PORT; }
	else if (StringFind(symbol,"CHFJPY",0)) { return CHFJPY_PORT; }
	else if (StringFind(symbol,"CHFSGD",0)) { return CHFSGD_PORT; }
	else if (StringFind(symbol,"EURAUD",0)) { return EURAUD_PORT; }
	else if (StringFind(symbol,"EURCAD",0)) { return EURCAD_PORT; }
	else if (StringFind(symbol,"EURCHF",0)) { return EURCHF_PORT; }
	else if (StringFind(symbol,"EURCZK",0)) { return EURCZK_PORT; }
	else if (StringFind(symbol,"EURGBP",0)) { return EURGBP_PORT; }
	else if (StringFind(symbol,"EURHUF",0)) { return EURHUF_PORT; }
	else if (StringFind(symbol,"EURJPY",0)) { return EURJPY_PORT; }
	else if (StringFind(symbol,"EURMXN",0)) { return EURMXN_PORT; }
	else if (StringFind(symbol,"EURNOK",0)) { return EURNOK_PORT; }
	else if (StringFind(symbol,"EURNZD",0)) { return EURNZD_PORT; }
	else if (StringFind(symbol,"EURPLN",0)) { return EURPLN_PORT; }
	else if (StringFind(symbol,"EURSEK",0)) { return EURSEK_PORT; }
	else if (StringFind(symbol,"EURSGD",0)) { return EURSGD_PORT; }
	else if (StringFind(symbol,"EURTRY",0)) { return EURTRY_PORT; }
	else if (StringFind(symbol,"EURUSD",0)) { return EURUSD_PORT; }
	else if (StringFind(symbol,"EURZAR",0)) { return EURZAR_PORT; }
	else if (StringFind(symbol,"GBPAUD",0)) { return GBPAUD_PORT; }
	else if (StringFind(symbol,"GBPCAD",0)) { return GBPCAD_PORT; }
	else if (StringFind(symbol,"GBPCHF",0)) { return GBPCHF_PORT; }
	else if (StringFind(symbol,"GBPJPY",0)) { return GBPJPY_PORT; }
	else if (StringFind(symbol,"GBPMXN",0)) { return GBPMXN_PORT; }
	else if (StringFind(symbol,"GBPNOK",0)) { return GBPNOK_PORT; }
	else if (StringFind(symbol,"GBPNZD",0)) { return GBPNZD_PORT; }
	else if (StringFind(symbol,"GBPSEK",0)) { return GBPSEK_PORT; }
	else if (StringFind(symbol,"GBPSGD",0)) { return GBPSGD_PORT; }
	else if (StringFind(symbol,"GBPTRY",0)) { return GBPTRY_PORT; }
	else if (StringFind(symbol,"GBPUSD",0)) { return GBPUSD_PORT; }
	else if (StringFind(symbol,"NOKJPY",0)) { return NOKJPY_PORT; }
	else if (StringFind(symbol,"NOKSEK",0)) { return NOKSEK_PORT; }
	else if (StringFind(symbol,"NZDCAD",0)) { return NZDCAD_PORT; }
	else if (StringFind(symbol,"NZDCHF",0)) { return NZDCHF_PORT; }
	else if (StringFind(symbol,"NZDJPY",0)) { return NZDJPY_PORT; }
	else if (StringFind(symbol,"NZDUSD",0)) { return NZDUSD_PORT; }
	else if (StringFind(symbol,"SEKJPY",0)) { return SEKJPY_PORT; }
	else if (StringFind(symbol,"SGDJPY",0)) { return SGDJPY_PORT; }
	else if (StringFind(symbol,"USDCAD",0)) { return USDCAD_PORT; }
	else if (StringFind(symbol,"USDCHF",0)) { return USDCHF_PORT; }
	else if (StringFind(symbol,"USDCNH",0)) { return USDCNH_PORT; }
	else if (StringFind(symbol,"USDCZK",0)) { return USDCZK_PORT; }
	else if (StringFind(symbol,"USDHKD",0)) { return USDHKD_PORT; }
	else if (StringFind(symbol,"USDHUF",0)) { return USDHUF_PORT; }
	else if (StringFind(symbol,"USDJPY",0)) { return USDJPY_PORT; }
	else if (StringFind(symbol,"USDMXN",0)) { return USDMXN_PORT; }
	else if (StringFind(symbol,"USDNOK",0)) { return USDNOK_PORT; }
	else if (StringFind(symbol,"USDPLN",0)) { return USDPLN_PORT; }
	else if (StringFind(symbol,"USDRUB",0)) { return USDRUB_PORT; }
	else if (StringFind(symbol,"USDSEK",0)) { return USDSEK_PORT; }
	else if (StringFind(symbol,"USDSGD",0)) { return USDSGD_PORT; }
	else if (StringFind(symbol,"USDTHB",0)) { return USDTHB_PORT; }
	else if (StringFind(symbol,"USDTRY",0)) { return USDTRY_PORT; }
	else if (StringFind(symbol,"USDZAR",0)) { return USDZAR_PORT; }
	else if (StringFind(symbol,"ZARJPY",0)) { return ZARJPY_PORT; }

	else if (StringFind(symbol,"Bitcoin",0)) { return BTCUSD_PORT; }
	else if (StringFind(symbol,"BitcoinCash",0)) { return BCHUSD_PORT; }
	else if (StringFind(symbol,"Dash",0)) { return DSHUSD_PORT; }
	else if (StringFind(symbol,"Ethereum",0)) { return ETHUSD_PORT; }
	else if (StringFind(symbol,"Litecoin",0)) { return LTCUSD_PORT; }

	else if (StringFind(symbol,"AUS200",0)) { return XAOAUD_PORT; }
	else if (StringFind(symbol,"CHINAA50",0)
		  || StringFind(symbol,"CHI50",0)
		  || StringFind(symbol,"CN50",0)) { return XINCNY_PORT; }
	else if (StringFind(symbol,"EUSTX50",0)
		  || StringFind(symbol,"ESTX50",0)
		  || StringFind(symbol,"EU50",0)) { return ESXEUR_PORT; }
	else if (StringFind(symbol,"FRA40",0)) { return PX1EUR_PORT; }
	else if (StringFind(symbol,"GER30",0)) { return DAXEUR_PORT; }
	else if (StringFind(symbol,"HK50",0)) { return HSIHKD_PORT; }
	else if (StringFind(symbol,"IT40",0)) { return MIBEUR_PORT; }
	else if (StringFind(symbol,"JPN225",0)
		  || StringFind(symbol,"JP225",0)) { return NIKJPY_PORT; }
	else if (StringFind(symbol,"NAS100",0)) { return NDXUSD_PORT; }
	else if (StringFind(symbol,"SPA35",0)
		  || StringFind(symbol,"ESP35",0)
		  || StringFind(symbol,"SPAIN35",0)) { return IBXEUR_PORT; }
	else if (StringFind(symbol,"UK100",0)) { return UKXGBP_PORT; }
	else if (StringFind(symbol,"US2000",0)) { return RUTUSD_PORT; }
	else if (StringFind(symbol,"US30",0)) { return DJIUSD_PORT; }
	else if (StringFind(symbol,"US500",0)
		  || StringFind(symbol,"SPX500",0)) { return USXUSD_PORT; }

	else if (StringFind(symbol,"XAGEUR",0)) { return XAGEUR_PORT; }
	else if (StringFind(symbol,"XAGUSD",0)) { return XAGUSD_PORT; }
	else if (StringFind(symbol,"XAUAUD",0)) { return XAUAUD_PORT; }
	else if (StringFind(symbol,"XAUEUR",0)) { return XAUEUR_PORT; }
	else if (StringFind(symbol,"XAUUSD",0)) { return XAUUSD_PORT; }
	else if (StringFind(symbol,"XBRUSD",0)) { return XBRUSD_PORT; }
	else if (StringFind(symbol,"XNGUSD",0)) { return XNGUSD_PORT; }
	else if (StringFind(symbol,"XPDUSD",0)) { return XPDUSD_PORT; }
	else if (StringFind(symbol,"XPTUSD",0)) { return XPTUSD_PORT; }
	else if (StringFind(symbol,"XTIUSD",0)) { return XTIUSD_PORT; }
	return 0;
}
