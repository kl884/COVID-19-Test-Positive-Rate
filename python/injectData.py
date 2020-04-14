import pandas as pd
import dateutil.parser
import os
import numpy as np
from scipy.optimize import leastsq

COLUMNS_FOR_POS_TREND = ['state','positive','positiveIncrease','totalTestResultsIncrease','total','dateChecked','death','recovered']
RELATIVE_PATH_CSV = ('./test.csv','/home/ubuntu/project/COVID-19-Test-Positive-Rate/backend/data.csv')[os.environ.get('PYTHON_ENVIRONMENT') == 'prod']

# for choropleth graph
def slice_latest(df):
    df_latest= df.head(56).copy()
    df_latest['total_pos_rate']= df_latest['positive']/df_latest['total']*100
    df_latest['daily_pos_rate']= df_latest['positiveIncrease']/df_latest['totalTestResultsIncrease']*100
    df_latest['date']= pd.to_datetime(df_latest['dateChecked'].str.slice(0, 10, 1), format= '%Y-%m-%d')
    df_latest['positive']= df_latest['positive'].fillna(0)
    df_latest['positive']= df_latest['positive'].round(0).astype(int)
    
    return df_latest

def prediction_data(df):
    df_Y= df[['date', 'positiveIncrease', 'positive']].iloc[::-1]
    df_Y= df_Y[13:].copy()
    df_Y.reset_index(inplace= True)
    df_Y['t']= pd.Series(range(1, df_Y['date'].count()+1))
    
    Y= df_Y['positiveIncrease']
    t= df_Y['t']
    
    # Cumulative positive cases
    c_Y= df_Y['positive']
    
    # initial variables(M, P & Q), estimate 20% of the population in NYS will be infected
    vars= [19.44e6*0.2, 0.03, 0.38]
    
    # residual (error) function
    def residual(vars, t, Y):
        M= vars[0]
        P= vars[1]
        Q= vars[2]
        Bass= M * (((P+Q)**2/P)*np.exp(-(P+Q)*t))/(1+(Q/P)*np.exp(-(P+Q)*t))**2 
        return (Bass - Y)
     
    # non linear least square fitting
    varfinal, success = leastsq(residual, vars, args=(t, Y))
    
    # estimated coefficients
    m= varfinal[0]
    p= varfinal[1]
    q= varfinal[2]
    
    print('M (estimated cumulative cases): %0.3e, p: %0.3e, q= %0.3e' % (m, p, q))
    
    # Extend date range for prediction
    pred_days= 41
    times = pd.date_range(df_Y.at[len(df_Y)-1, 'date'], periods= pred_days, freq= '1D')
    df_times = pd.DataFrame({'date': times[1:]})
    df_Y= df_Y.append(df_times, ignore_index = True, sort= False)
    df_Y['t']= pd.Series(range(1,df_Y['date'].count()+1))
    
    # model with time interpolation
    tp= df_Y['t']
    cofactor= np.exp(-(p+q)*tp)
    df_Y['positiveIncrease_pdf']= m*(((p+q)**2/p)*cofactor)/(1+(q/p)*cofactor)**2

# for line graphs
def slice_state(df, state=None):
    # df_state= df.loc[df['state'] == state]
    if state is not None:
        df = df.loc[df['state'] == state]
    
    if state == 'NY':

    data_for_graph = {
        'state': df['state'],
        'total_pos_rate': df['positive']/df['total']*100,
        'daily_pos_Rate': df['positiveIncrease']/df['totalTestResultsIncrease']*100,

        # date is in ISO 8601 format by default, now converting to miliseconds unix timestamp
        # REMINDER can use ISO 8601 string for drawing chart but will test later
        'date':list(map(lambda date: dateutil.parser.parse(date).timestamp()*1000, df['dateChecked'])), 
        
        'totalTestResultsIncrease':df['totalTestResultsIncrease'],
        'positive': df['positive'].fillna(0),

        # stack plot
        'death': df['death'].fillna(0),
        'recovered': df['recovered'].fillna(0),
        'active': df['positive'].fillna(0) - df['death'].fillna(0) - df['recovered'].fillna(0)
    }
    result_df = pd.DataFrame(data_for_graph)
    result_df.to_csv(RELATIVE_PATH_CSV, index=False, header=True)
    return result_df

if __name__ == '__main__':
    # df = pd.DataFrame()
    df = pd.read_csv('http://covidtracking.com/api/states/daily.csv', usecols=COLUMNS_FOR_POS_TREND)
    print(df.head())
    df_states = slice_state(df)
    print(df_states)