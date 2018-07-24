#property copyright "Paul de Renty"
#property link      ""
#property version   "1.00"
#property strict

#include <str_informator.mqh>

#define URI     "127.0.0.1"
#define PORT	20001

#define MSG_QUOTE_CONCAT  001
#define MSG_ACCOUNT_INFO_CONCAT  002
#define MSG_MARKET_INFO_CONCAT  003

#define MSG_ACCOUNT_NUMBER  101
#define MSG_ACCOUNT_NAME  102
#define MSG_ACCOUNT_BROKER_NAME  103
#define MSG_ACCOUNT_SERVER  104
#define MSG_ACCOUNT_CURRENCY  105
#define MSG_ACCOUNT_CREDIT  106
#define MSG_ACCOUNT_LEVERAGE  107
#define MSG_ACCOUNT_STOPOUT_LVL  108
#define MSG_ACCOUNT_STOPOUT_MODE  109
#define MSG_ACCOUNT_MARGIN  110
#define MSG_ACCOUNT_FREE_MARGIN  111
#define MSG_ACCOUNT_BALANCE  112
#define MSG_ACCOUNT_EQUITY  113
#define MSG_ACCOUNT_PROFIT  114
#define MSG_ACCOUNT_RELATIVE_DRAWDAWN  115
#define MSG_ACCOUNT_ABSOLUTE_DRAWDAWN  116

#define MSG_TRADEALLOWED  201
#define MSG_LEVERAGE  202
#define MSG_RECQUIRED_MARGIN  203
#define MSG_LOTSIZE  204
#define MSG_MIN_LOT  205
#define MSG_MAX_LOT  206
#define MSG_LOT_STEP  208
#define MSG_TICK_SIZE  209
#define MSG_TICK_VALUE  210
#define MSG_LOT_VALUE  211
#define MSG_STOP_LEVEL  212
#define MSG_FREEZE_LEVEL  213
#define MSG_BID  214
#define MSG_ASK  215
#define MSG_SPREAD  216
#define MSG_SWAP_LONG  217
#define MSG_SWAP_SHORT  218
#define MSG_STARTING  219
#define MSG_EXPIRY  220
#define MSG_STREAK  221
#define MSG_WINRATE  222
#define MSG_ABSOLUTE_DRAWDOWN  223
#define MSG_RELATIVE_DRAWDOWN  224
#define MSG_LOSS_SUM  225
#define MSG_PROFIT_SUM  226
#define MSG_PNL  227
#define MSG_ORDER_SUM  228

string     get_res(string msg_recv) {
	string 	id = StringSubstr(msg_recv, 0, 3);
	string 	symbol = NULL;
	int 	code_in = StrToInteger(id);
	if (StringLen(msg_recv) > 4) {
		symbol = StringSubstr(msg_recv, 4, 6);
		//broker commodities / indices have different identifiers than my ISOs
		if		(symbol == "BTCUSD") { symbol = "Bitcoin"; }
		else if (symbol == "BCHUSD") { symbol = "BitcoinCash"; }
		else if (symbol == "DSHUSD") { symbol = "Dash"; }
		else if (symbol == "ETHUSD") { symbol = "Ethereum"; }
		else if (symbol == "LTCUSD") { symbol = "Litecoin"; }
		else if (symbol == "XAOAUD") { symbol = "AUS200"; }
		else if (symbol == "XINCNY") { symbol = "CN50"; }
		else if (symbol == "ESXEUR") { symbol = "EUSTX50"; }
		else if (symbol == "PX1EUR") { symbol = "FRA40"; }
		else if (symbol == "DAXEUR") { symbol = "GER30"; }
		else if (symbol == "HSIHKD") { symbol = "HK50"; }
		else if (symbol == "MIBEUR") { symbol = "IT40"; }
		else if (symbol == "NIKJPY") { symbol = "JPN225"; }
		else if (symbol == "NDXUSD") { symbol = "NAS100"; }
		else if (symbol == "IBXEUR") { symbol = "SPA35"; }
		else if (symbol == "UKXGBP") { symbol = "UK100"; }
		else if (symbol == "RUTUSD") { symbol = "US2000"; }
		else if (symbol == "DJIUSD") { symbol = "US30"; }
		else if (symbol == "USXUSD") { symbol = "US500"; }
	}
    switch (code_in) {
		case (MSG_QUOTE_CONCAT):
			return (GetQuoteConcat(",", false));
		case (MSG_ACCOUNT_INFO_CONCAT):
			return (GetAccountInfoConcat(",", true));
		case (MSG_MARKET_INFO_CONCAT):
			return (GetMarketInfoConcat(symbol, ",", true));
		case (MSG_ACCOUNT_NUMBER):
			return (GetAccountNumber());
		case (MSG_ACCOUNT_NAME):
			return (GetAccountName());
		case (MSG_ACCOUNT_BROKER_NAME):
			return (GetAccountBrokerName());
		case (MSG_ACCOUNT_SERVER):
			return (GetAccountServer());
		case (MSG_ACCOUNT_CURRENCY):
			return (GetAccountCurrency());
		case (MSG_ACCOUNT_CREDIT):
			return (GetAccountCredit());
		case (MSG_ACCOUNT_LEVERAGE):
			return (GetAccountLeverage());
		case (MSG_ACCOUNT_STOPOUT_LVL):
			return (GetAccountStopoutLvl());
		case (MSG_ACCOUNT_STOPOUT_MODE):
			return (GetAccountStopoutMode());
		case (MSG_ACCOUNT_MARGIN):
			return (GetAccountMargin());
		case (MSG_ACCOUNT_FREE_MARGIN):
			return (GetAccountFreeMargin());
		case (MSG_ACCOUNT_BALANCE):
			return (GetAccountBalance());
		case (MSG_ACCOUNT_EQUITY):
			return (GetAccountEquity());
		case (MSG_ACCOUNT_PROFIT):
			return (GetAccountProfit());
		case (MSG_ACCOUNT_RELATIVE_DRAWDAWN):
			return (GetAccountRelativeDrawdawn());
		case (MSG_ACCOUNT_ABSOLUTE_DRAWDAWN):
			return (GetAccountAbsoluteDrawdawn());
		case (MSG_TRADEALLOWED):
			return (GetTradeAllowed(symbol));
		case (MSG_LEVERAGE):
			return (GetLeverage(symbol));
		case (MSG_RECQUIRED_MARGIN):
			return (GetRecquiredMargin(symbol));
		case (MSG_LOTSIZE):
			return (GetLotSize(symbol));
		case (MSG_MIN_LOT):
			return (GetMinLot(symbol));
		case (MSG_MAX_LOT):
			return (GetMaxLot(symbol));
		case (MSG_LOT_STEP):
			return (GetLotStep(symbol));
		case (MSG_TICK_SIZE):
			return (GetTickSize(symbol));
		case (MSG_TICK_VALUE):
			return (GetTickValue(symbol));
		case (MSG_LOT_VALUE):
			return (GetLotValue(symbol));
		case (MSG_STOP_LEVEL):
			return (GetStopLevel(symbol));
		case (MSG_FREEZE_LEVEL):
			return (GetFreezeLevel(symbol));
		case (MSG_BID):
			return (GetBid(symbol));
		case (MSG_ASK):
			return (GetAsk(symbol));
		case (MSG_SPREAD):
			return (GetSpread(symbol));
		case (MSG_SWAP_LONG):
			return (GetSwapLong(symbol));
		case (MSG_SWAP_SHORT):
			return (GetSwapShort(symbol));
		case (MSG_STARTING):
			return (GetStarting(symbol));
		case (MSG_EXPIRY):
			return (GetExpiry(symbol));
		// case (MSG_STREAK):
		// 	return (GetStreak(....));
		// case (MSG_WINRATE):
		// 	return (GetWinRate());
		// case (MSG_ABSOLUTE_DRAWDOWN):
		// 	return (GetAbsoluteDrawdown());
		// case (MSG_RELATIVE_DRAWDOWN):
		// 	return (GetRelativeDrawdown());
		// case (MSG_LOSS_SUM):
		// 	return (GetLossSum());
		// case (MSG_PROFIT_SUM):
		// 	return (GetProfitSum());
		// case (MSG_PNL):
		// 	return (GetPNL());
		// case (MSG_ORDER_SUM):
		// 	return (GetOrderSum());
    }
    return (NULL);
}