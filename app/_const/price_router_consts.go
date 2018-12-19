package _const

//should I type the consts?
//const PORT uint16 = 2xxxx >> the TCP range fits inside an unsignes 16 bits uint
const ( //uint16
	AUDCAD_PORT = 21001
	AUDCHF_PORT = 21002
	AUDJPY_PORT = 21003
	AUDNZD_PORT = 21004
	AUDSGD_PORT = 21005
	AUDUSD_PORT = 21006
	CADCHF_PORT = 21007
	CADJPY_PORT = 21008
	CHFJPY_PORT = 21009
	CHFSGD_PORT = 21010
	EURAUD_PORT = 21011
	EURCAD_PORT = 21012
	EURCHF_PORT = 21013
	EURCZK_PORT = 21014
	EURGBP_PORT = 21015
	EURHUF_PORT = 21016
	EURJPY_PORT = 21017
	EURMXN_PORT = 21018
	EURNOK_PORT = 21019
	EURNZD_PORT = 21020
	EURPLN_PORT = 21021
	EURSEK_PORT = 21022
	EURSGD_PORT = 21023
	EURTRY_PORT = 21024
	EURUSD_PORT = 21025
	EURZAR_PORT = 21026
	GBPAUD_PORT = 21027
	GBPCAD_PORT = 21028
	GBPCHF_PORT = 21029
	GBPJPY_PORT = 21030
	GBPMXN_PORT = 21031
	GBPNOK_PORT = 21032
	GBPNZD_PORT = 21033
	GBPSEK_PORT = 21034
	GBPSGD_PORT = 21035
	GBPTRY_PORT = 21036
	GBPUSD_PORT = 21037
	NOKJPY_PORT = 21038
	NOKSEK_PORT = 21039
	NZDCAD_PORT = 21040
	NZDCHF_PORT = 21041
	NZDJPY_PORT = 21042
	NZDUSD_PORT = 21043
	SEKJPY_PORT = 21044
	SGDJPY_PORT = 21045
	USDCAD_PORT = 21046
	USDCHF_PORT = 21047
	USDCNH_PORT = 21048
	USDCZK_PORT = 21049
	USDHKD_PORT = 21050
	USDHUF_PORT = 21051
	USDJPY_PORT = 21052
	USDMXN_PORT = 21053
	USDNOK_PORT = 21054
	USDPLN_PORT = 21055
	USDRUB_PORT = 21056
	USDSEK_PORT = 21057
	USDSGD_PORT = 21058
	USDTHB_PORT = 21059
	USDTRY_PORT = 21060
	USDZAR_PORT = 21061
	ZARJPY_PORT = 21062
)

func PortToSymbol(port uint16)(string) {
	switch port {
		case 21001:
			return "AUDCAD"
		case 21002:
			return "AUDCHF"
		case 21003:
			return "AUDJPY"
		case 21004:
			return "AUDNZD"
		case 21005:
			return "AUDSGD"
		case 21006:
			return "AUDUSD"
		case 21007:
			return "CADCHF"
		case 21008:
			return "CADJPY"
		case 21009:
			return "CHFJPY"
		case 21010:
			return "CHFSGD"
		case 21011:
			return "EURAUD"
		case 21012:
			return "EURCAD"
		case 21013:
			return "EURCHF"
		case 21014:
			return "EURCZK"
		case 21015:
			return "EURGBP"
		case 21016:
			return "EURHUF"
		case 21017:
			return "EURJPY"
		case 21018:
			return "EURMXN"
		case 21019:
			return "EURNOK"
		case 21020:
			return "EURNZD"
		case 21021:
			return "EURPLN"
		case 21022:
			return "EURSEK"
		case 21023:
			return "EURSGD"
		case 21024:
			return "EURTRY"
		case 21025:
			return "EURUSD"
		case 21026:
			return "EURZAR"
		case 21027:
			return "GBPAUD"
		case 21028:
			return "GBPCAD"
		case 21029:
			return "GBPCHF"
		case 21030:
			return "GBPJPY"
		case 21031:
			return "GBPMXN"
		case 21032:
			return "GBPNOK"
		case 21033:
			return "GBPNZD"
		case 21034:
			return "GBPSEK"
		case 21035:
			return "GBPSGD"
		case 21036:
			return "GBPTRY"
		case 21037:
			return "GBPUSD"
		case 21038:
			return "NOKJPY"
		case 21039:
			return "NOKSEK"
		case 21040:
			return "NZDCAD"
		case 21041:
			return "NZDCHF"
		case 21042:
			return "NZDJPY"
		case 21043:
			return "NZDUSD"
		case 21044:
			return "SEKJPY"
		case 21045:
			return "SGDJPY"
		case 21046:
			return "USDCAD"
		case 21047:
			return "USDCHF"
		case 21048:
			return "USDCNH"
		case 21049:
			return "USDCZK"
		case 21050:
			return "USDHKD"
		case 21051:
			return "USDHUF"
		case 21052:
			return "USDJPY"
		case 21053:
			return "USDMXN"
		case 21054:
			return "USDNOK"
		case 21055:
			return "USDPLN"
		case 21056:
			return "USDRUB"
		case 21057:
			return "USDSEK"
		case 21058:
			return "USDSGD"
		case 21059:
			return "USDTHB"
		case 21060:
			return "USDTRY"
		case 21061:
			return "USDZAR"
		case 21062:
			return "ZARJPY"
	}
	return "Symbol Error"
}
