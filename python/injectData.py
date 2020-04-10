import pandas as pd
import dateutil.parser

COLUMNS_FOR_POS_TREND = ['state','positive','positiveIncrease','totalTestResultsIncrease','total','dateChecked']
RELATIVE_PATH_CSV = './test.csv'

# for choropleth graph
def slice_latest(df):
    df_latest= df.head(56).copy()
    df_latest['total_pos_rate']= df_latest['positive']/df_latest['total']*100
    df_latest['daily_pos_rate']= df_latest['positiveIncrease']/df_latest['totalTestResultsIncrease']*100
    df_latest['date']= pd.to_datetime(df_latest['dateChecked'].str.slice(0, 10, 1), format= '%Y-%m-%d')
    df_latest['positive']= df_latest['positive'].fillna(0)
    df_latest['positive']= df_latest['positive'].round(0).astype(int)
    
    return df_latest

# for line graphs
def slice_state(df, state):
    df_state= df.loc[df['state'] == state]
    df_state.reset_index(inplace= True)
    data_for_graph = 
    {
        'total_pos_rate': df_state['positive']/df_state['total']*100,
        'daily_pos_Rate': df_state['positiveIncrease']/df_state['totalTestResultsIncrease']*100,
        'date':list(map(lambda date: dateutil.parser.parse(date).timestamp()*1000, df_state['dateChecked'])), # REMINDER can use ISO 8601 string for drawing chart but will test later
        'totalTestResultsIncrease':df_state['totalTestResultsIncrease']
    }
    result_df = pd.DataFrame(data_for_graph)
    result_df.to_csv(RELATIVE_PATH_CSV, index=False, header=True)
    return result_df

if __name__ == '__main__':
    # df = pd.DataFrame()
    df = pd.read_csv('http://covidtracking.com/api/states/daily.csv', usecols=COLUMNS_FOR_POS_TREND)
    print(df.head())
    df_ny = slice_state(df,'NY')
    print(df_ny)