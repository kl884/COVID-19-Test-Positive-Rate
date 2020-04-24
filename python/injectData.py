import pandas as pd
import dateutil.parser
import os
import numpy as np
from scipy.optimize import leastsq
import logging
from datetime import datetime

# Constants
COLUMNS_FOR_POS_TREND = ['state','positive','positiveIncrease','totalTestResultsIncrease','total','dateChecked','death','recovered']
COLUMNS_FOR_POPULATION = ['POPESTIMATE2019']
COLUMNS_FOR_PRED_DATA = ['state','date','positiveIncrease_pdf','positive_cdf']
RELATIVE_PATH_CSV = ('./test.csv','/home/ubuntu/project/COVID-19-Test-Positive-Rate/backend/data.csv')[os.environ.get('PYTHON_ENVIRONMENT') == 'prod']
RELATIVE_PATH_CSV_PRED = ('./predData.csv','/home/ubuntu/project/COVID-19-Test-Positive-Rate/backend/predData.csv')[os.environ.get('PYTHON_ENVIRONMENT') == 'prod']
LOG_FILE = ('injectData.log','/home/ubuntu/project/COVID-19-Test-Positive-Rate/python/injectData.log')[os.environ.get('PYTHON_ENVIRONMENT') == 'prod']
logging.basicConfig(filename=LOG_FILE,level=logging.DEBUG)

# for choropleth graph
def slice_latest(df):
    df_latest= df.head(56).copy()
    df_latest['total_pos_rate']= df_latest['positive']/df_latest['total']*100
    df_latest['daily_pos_rate']= df_latest['positiveIncrease']/df_latest['totalTestResultsIncrease']*100
    df_latest['date']= pd.to_datetime(df_latest['dateChecked'].str.slice(0, 10, 1), format= '%Y-%m-%d')
    df_latest['positive']= df_latest['positive'].fillna(0)
    df_latest['positive']= df_latest['positive'].round(0).astype(int)
    
    return df_latest

def prediction_data(df, test=False):
    # If bass_df == True:
    #     Returns a dataframe contains state's actual data and modeled data and varfinal[M,p,q]
    # If bass_df == False (default):
    #     Print M, p, q and plot the actual modeled data
    population= pd.read_csv('https://raw.githubusercontent.com/eestanleyland/COVID-19-Test-Positive-Rate/master/data/nst-est2019-alldata.csv', usecols=COLUMNS_FOR_POPULATION)

    StateNameList= ['United States', 'Northeast Region', 'Midwest Region', 'South Region', 'West Region', 
           'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'District of Columbia', 'FL', 'GA', 
           'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 
           'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 
           'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'Puerto Rico']

    StateOptionList= ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 
           'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 
           'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 
           'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY']

    population['state']= StateNameList
    
    data_for_model = {
        'state': df['state'],
        'date': pd.to_datetime(df['dateChecked'].str.slice(0, 10, 1), format= '%Y-%m-%d'),
        'positiveIncrease': df['positiveIncrease'].fillna(0),
        'positive': df['positive'].fillna(0)
    }
    states_df = pd.DataFrame(data_for_model)
    result_df = pd.DataFrame(columns=COLUMNS_FOR_PRED_DATA)
    if test is True:
        StateOptionList=['AL']
    for state in StateOptionList:
        TEST_STATE=state
        df_state= states_df.loc[states_df['state']==TEST_STATE]
        state_pop = int(population['POPESTIMATE2019'].loc[population.state == TEST_STATE])

        df_Y= df_state[['date', 'positiveIncrease', 'positive']].iloc[::-1]
        df_Y.reset_index(inplace= True)

        if TEST_STATE == 'NY':
            threshold= 500
        else:
            threshold= 10

        day= 0
        daily_increase= 0
        while daily_increase < threshold:
            day+= 1
            daily_increase= df_Y.at[day, 'positiveIncrease']

        df_Y= df_Y[day:].copy()
        df_Y.reset_index(inplace= True)
        df_Y['t']= pd.Series(range(1, len(df_Y['date'])+1))

        Y= df_Y['positiveIncrease']
        t= df_Y['t']

        # Cumulative positive cases
        c_Y= df_Y['positive']

        # initial variables(M, P & Q), estimate 20% of the population in NYS will be infected
        vars= [state_pop*0.015, 0.03, 0.38]

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
        # Extend date range for prediction
        pred_days= 41
        times = pd.date_range(df_Y.at[len(df_Y)-1, 'date'], periods= pred_days, freq= '1D')
        df_times = pd.DataFrame({'date': times[1:]})
        df_Y= df_Y.append(df_times, ignore_index = True, sort= False)
        df_Y['date'] = pd.DatetimeIndex(df_Y['date']).astype(np.int64) // 10**9 + 20 * 60 * 60 # Add back the truncated time
        df_Y['t']= pd.Series(range(1, len(df_Y['date'])+1))

        # model with time interpolation
        tp= df_Y['t']
        cofactor= np.exp(-(p+q)*tp)
        df_Y['positiveIncrease_pdf']= m*(((p+q)**2/p)*cofactor)/(1+(q/p)*cofactor)**2
        df_Y['positive_cdf']= m*(1-cofactor)/(1+(q/p)*cofactor)
        df_Y = df_Y[['date', 'positive','positiveIncrease','positiveIncrease_pdf', 'positive_cdf']]
        df_Y['state'] = TEST_STATE
        df_Y['date'] = df_Y['date']*1000
        result_df = result_df.append(df_Y)
    result_df.to_csv(RELATIVE_PATH_CSV_PRED, index=False, header=True)
    return result_df


# for line graphs
def slice_state(df, state=None):
    # df_state= df.loc[df['state'] == state]
    if state is not None:
        df = df.loc[df['state'] == state]
    
    active_column = df['positive'] - df['death'] - df['recovered']
    data_for_graph = {
        'state': df['state'],
        'total_pos_rate': df['positive']/df['total']*100,
        'daily_pos_Rate': df['positiveIncrease']/df['totalTestResultsIncrease']*100,

        # date is in ISO 8601 format by default, now converting to miliseconds unix timestamp
        # REMINDER can use ISO 8601 string for drawing chart but will test later
        'date':list(map(lambda date: dateutil.parser.parse(date).timestamp()*1000, df['dateChecked'])), 
        
        'totalTestResultsIncrease':df['totalTestResultsIncrease'],
        'positive': df['positive'],

        # stack plot
        'death': df['death'],
        'recovered': df['recovered'].where(active_column >= 0, df['positive'] - df['death']),
        'active': np.clip(active_column, 0, None)
    }
    result_df = pd.DataFrame(data_for_graph)
    result_df.to_csv(RELATIVE_PATH_CSV, index=False, header=True)
    return result_df

def log_output(message, log_type='info'):
    cur_time_string = "[{}] ".format(datetime.now().strftime("%m/%d/%Y, %H:%M:%S"))
    if log_type == 'info':
        logging.info(cur_time_string + message)
    elif log_type == 'error':
        if isinstance(message, Exception):
            logging.error(cur_time_string + str(message))
        elif isinstance(message, str):
            logging.error(cur_time_string + message)
        

if __name__ == '__main__':
    try:
        df = pd.read_csv('http://covidtracking.com/api/states/daily.csv', usecols=COLUMNS_FOR_POS_TREND)
        df = df.fillna(0)
        log_output("Fetch data count: {}".format(len(df.index)))
        df_states = slice_state(df)
        log_output("Sliced state count: {}".format(len(df_states.index)))
        df_prediction = prediction_data(df)
        log_output("Prediction data count: {}".format(len(df_prediction.index)))
    except Exception as e:
        log_output(e, log_type='error')
