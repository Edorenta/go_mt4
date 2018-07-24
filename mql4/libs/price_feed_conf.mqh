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

ushort     get_feed_port(string symbol) {
	if 		(symbol == "AUDCAD") { return AUDCAD_PORT; }
	else if (symbol == "AUDCHF") { return AUDCHF_PORT; }
	else if (symbol == "AUDJPY") { return AUDJPY_PORT; }
	else if (symbol == "AUDNZD") { return AUDNZD_PORT; }
	else if (symbol == "AUDSGD") { return AUDSGD_PORT; }
	else if (symbol == "AUDUSD") { return AUDUSD_PORT; }
	else if (symbol == "CADCHF") { return CADCHF_PORT; }
	else if (symbol == "CADJPY") { return CADJPY_PORT; }
	else if (symbol == "CHFJPY") { return CHFJPY_PORT; }
	else if (symbol == "CHFSGD") { return CHFSGD_PORT; }
	else if (symbol == "EURAUD") { return EURAUD_PORT; }
	else if (symbol == "EURCAD") { return EURCAD_PORT; }
	else if (symbol == "EURCHF") { return EURCHF_PORT; }
	else if (symbol == "EURCZK") { return EURCZK_PORT; }
	else if (symbol == "EURGBP") { return EURGBP_PORT; }
	else if (symbol == "EURHUF") { return EURHUF_PORT; }
	else if (symbol == "EURJPY") { return EURJPY_PORT; }
	else if (symbol == "EURMXN") { return EURMXN_PORT; }
	else if (symbol == "EURNOK") { return EURNOK_PORT; }
	else if (symbol == "EURNZD") { return EURNZD_PORT; }
	else if (symbol == "EURPLN") { return EURPLN_PORT; }
	else if (symbol == "EURSEK") { return EURSEK_PORT; }
	else if (symbol == "EURSGD") { return EURSGD_PORT; }
	else if (symbol == "EURTRY") { return EURTRY_PORT; }
	else if (symbol == "EURUSD") { return EURUSD_PORT; }
	else if (symbol == "EURZAR") { return EURZAR_PORT; }
	else if (symbol == "GBPAUD") { return GBPAUD_PORT; }
	else if (symbol == "GBPCAD") { return GBPCAD_PORT; }
	else if (symbol == "GBPCHF") { return GBPCHF_PORT; }
	else if (symbol == "GBPJPY") { return GBPJPY_PORT; }
	else if (symbol == "GBPMXN") { return GBPMXN_PORT; }
	else if (symbol == "GBPNOK") { return GBPNOK_PORT; }
	else if (symbol == "GBPNZD") { return GBPNZD_PORT; }
	else if (symbol == "GBPSEK") { return GBPSEK_PORT; }
	else if (symbol == "GBPSGD") { return GBPSGD_PORT; }
	else if (symbol == "GBPTRY") { return GBPTRY_PORT; }
	else if (symbol == "GBPUSD") { return GBPUSD_PORT; }
	else if (symbol == "NOKJPY") { return NOKJPY_PORT; }
	else if (symbol == "NOKSEK") { return NOKSEK_PORT; }
	else if (symbol == "NZDCAD") { return NZDCAD_PORT; }
	else if (symbol == "NZDCHF") { return NZDCHF_PORT; }
	else if (symbol == "NZDJPY") { return NZDJPY_PORT; }
	else if (symbol == "NZDUSD") { return NZDUSD_PORT; }
	else if (symbol == "SEKJPY") { return SEKJPY_PORT; }
	else if (symbol == "SGDJPY") { return SGDJPY_PORT; }
	else if (symbol == "USDCAD") { return USDCAD_PORT; }
	else if (symbol == "USDCHF") { return USDCHF_PORT; }
	else if (symbol == "USDCNH") { return USDCNH_PORT; }
	else if (symbol == "USDCZK") { return USDCZK_PORT; }
	else if (symbol == "USDHKD") { return USDHKD_PORT; }
	else if (symbol == "USDHUF") { return USDHUF_PORT; }
	else if (symbol == "USDJPY") { return USDJPY_PORT; }
	else if (symbol == "USDMXN") { return USDMXN_PORT; }
	else if (symbol == "USDNOK") { return USDNOK_PORT; }
	else if (symbol == "USDPLN") { return USDPLN_PORT; }
	else if (symbol == "USDRUB") { return USDRUB_PORT; }
	else if (symbol == "USDSEK") { return USDSEK_PORT; }
	else if (symbol == "USDSGD") { return USDSGD_PORT; }
	else if (symbol == "USDTHB") { return USDTHB_PORT; }
	else if (symbol == "USDTRY") { return USDTRY_PORT; }
	else if (symbol == "USDZAR") { return USDZAR_PORT; }
	else if (symbol == "ZARJPY") { return ZARJPY_PORT; }

	else if (symbol == "Bitcoin") { return BTCUSD_PORT; }
	else if (symbol == "BitcoinCash") { return BCHUSD_PORT; }
	else if (symbol == "Dash") { return DSHUSD_PORT; }
	else if (symbol == "Ethereum") { return ETHUSD_PORT; }
	else if (symbol == "Litecoin") { return LTCUSD_PORT; }

	else if (symbol == "AUS200") { return XAOAUD_PORT; }
	else if (symbol == "CN50") { return XINCNY_PORT; }
	else if (symbol == "EUSTX50") { return ESXEUR_PORT; }
	else if (symbol == "FRA40") { return PX1EUR_PORT; }
	else if (symbol == "GER30") { return DAXEUR_PORT; }
	else if (symbol == "HK50") { return HSIHKD_PORT; }
	else if (symbol == "IT40") { return MIBEUR_PORT; }
	else if (symbol == "JPN225") { return NIKJPY_PORT; }
	else if (symbol == "NAS100") { return NDXUSD_PORT; }
	else if (symbol == "SPA35") { return IBXEUR_PORT; }
	else if (symbol == "UK100") { return UKXGBP_PORT; }
	else if (symbol == "US2000") { return RUTUSD_PORT; }
	else if (symbol == "US30") { return DJIUSD_PORT; }
	else if (symbol == "US500") { return USXUSD_PORT; }


	else if (symbol == "XAGEUR") { return XAGEUR_PORT; }
	else if (symbol == "XAGUSD") { return XAGUSD_PORT; }
	else if (symbol == "XAUAUD") { return XAUAUD_PORT; }
	else if (symbol == "XAUEUR") { return XAUEUR_PORT; }
	else if (symbol == "XAUUSD") { return XAUUSD_PORT; }
	else if (symbol == "XBRUSD") { return XBRUSD_PORT; }
	else if (symbol == "XNGUSD") { return XNGUSD_PORT; }
	else if (symbol == "XPDUSD") { return XPDUSD_PORT; }
	else if (symbol == "XPTUSD") { return XPTUSD_PORT; }
	else if (symbol == "XTIUSD") { return XTIUSD_PORT; }
	return 0;
}