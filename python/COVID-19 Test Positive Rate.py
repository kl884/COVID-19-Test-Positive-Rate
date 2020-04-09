
# coding: utf-8

# In[13]:


import numpy as np
import pandas as pd
import matplotlib.dates as mdates
import datetime
from matplotlib.dates import MO, TU, WE, TH, FR, SA, SU
import plotly.graph_objects as go

from scipy.optimize import leastsq
from scipy.optimize import curve_fit

import matplotlib.pyplot as plt
get_ipython().run_line_magic('matplotlib', 'inline')
import seaborn as sns
from mpl_toolkits.axes_grid1 import make_axes_locatable


# # Load Data

# In[170]:


df= pd.DataFrame()
df= pd.read_csv('http://covidtracking.com/api/states/daily.csv')
df.head()


# # Overview by State

# In[4]:


def latest_by_state(df, action_index= 0):
    df_latest= slice_latest(df)
    plot_by_state(df_latest, action_index)


# In[5]:


def slice_latest(df):
    df_latest= df.head(56).copy()
    df_latest['total_pos_rate']= df_latest['positive']/df_latest['total']*100
    df_latest['daily_pos_rate']= df_latest['positiveIncrease']/df_latest['totalTestResultsIncrease']*100
    df_latest['date']= pd.to_datetime(df_latest['dateChecked'].str.slice(0, 10, 1), format= '%Y-%m-%d')
    df_latest['positive']= df_latest['positive'].fillna(0)
    df_latest['positive']= df_latest['positive'].round(0).astype(int)
    
    return df_latest


# In[6]:


def plot_by_state(df, action_index):
    # If action_index == 0, plot test positive rate by state
    # If action_index == 1, plot positive cases by state
    
    data= {'variable': ['total_pos_rate', 'positive'],
           'plot_title': ['Total Test Positive Rate', 'Total Positive Cases'],
           'legend': ['Test Positive Rate (%)', 'Positive Cases']}
    action= pd.DataFrame(data, columns= ['variable', 'plot_title', 'legend'])
    
    for col in df.columns:
        df[col] = df[col].astype(str)

    if action_index == 0:
        df['text']= 'Total positive cases: ' + df['positive'] + '<br>' + 'Total test results: ' + df['totalTestResults']
    if action_index == 1:
        df['text']= 'Total death: ' + df['death']
        
    fig = go.Figure(data= go.Choropleth(
        locations= df['state'], # Spatial coordinates
        z= df[action['variable'][action_index]].astype(float), # Data to be color-coded
        locationmode= 'USA-states', # set of locations match entries in `locations`
        colorscale= 'Reds',
        text= df['text'], # hover text
        marker_line_color= 'white',
        colorbar_title= action['legend'][action_index],
    ))

    fig.update_layout(
        title_text = 'COVID-19 %s by State (updated on %s)' % (action['plot_title'][action_index], df['date'][0]),
        geo_scope='usa', # limite map scope to USA
    )

    fig.show()


# # Bass Model Prediction for Cases by State

# In[215]:


df_state= slice_state(df, 'NY')

df_Y= df_state[['date', 'positiveIncrease', 'positive']].iloc[::-1]
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
pred_days= 61
times = pd.date_range(df_Y.at[len(df_Y)-1, 'date'], periods= pred_days, freq= '1D')
df_times = pd.DataFrame({'date': times[1:]})
df_Y= df_Y.append(df_times, ignore_index = True, sort= False)
df_Y['t']= pd.Series(range(1,df_Y['date'].count()+1))

# model with time interpolation
tp= df_Y['t']
cofactor= np.exp(-(p+q)*tp)
df_Y['positiveIncrease_pdf']= m*(((p+q)**2/p)*cofactor)/(1+(q/p)*cofactor)**2

# daily new case plot
#plt.plot(df_Y['date'], df_Y['positiveIncrease_pdf'], df_Y['date'], df_Y['positiveIncrease'])
#plt.title('positiveIncrease_pdf')
#plt.legend(['Model', 'Actual'])
#plt.show()

sns.reset_orig()
date_form= mdates.DateFormatter("%m-%d")
weekday= SU
state= 'NY'

fig0, ax0= plt.subplots(figsize=(8.4, 5))
plt.plot(df_Y['date'], df_Y['positiveIncrease_pdf'], df_Y['date'], df_Y['positiveIncrease'])
ax0.fmt_xdata= date_form # mdates.DateFormatter('%m-%d')
ax0.grid()
ax0.legend(['Model', 'Actual'])
ax0.set(ylabel= 'Positive Cases', title= state + ' State COVID-19 Daily New Cases Prediction')
fig0.autofmt_xdate()    
ax0.xaxis.set_major_formatter(date_form)
ax0.xaxis.set_major_locator(mdates.WeekdayLocator(byweekday= weekday))

# Cumulative positive cases (cdf)
df_Y['positive_cdf'] = m*(1-cofactor)/(1+(q/p)*cofactor)
#plt.plot(tp, positive_cdf, t, c_Y)
#plt.title('Positive Cases cdf')
#plt.legend(['Model', 'Actual'])
#plt.show()

fig1, ax1= plt.subplots(figsize=(8.4, 5))
plt.plot(df_Y['date'], df_Y['positive_cdf'], df_Y['date'], df_Y['positive'])
ax1.fmt_xdata= date_form # mdates.DateFormatter('%m-%d')
ax1.grid()
ax1.legend(['Model', 'Actual'])
ax1.set(ylabel= 'Cumulative Positive Cases', title= state + ' State COVID-19 Cumulative Cases Prediction')
fig1.autofmt_xdate()    
ax1.xaxis.set_major_formatter(date_form)
ax1.xaxis.set_major_locator(mdates.WeekdayLocator(byweekday= weekday))


# # Test Positive Rate Trend by State

# In[7]:


def state_pos_rate(df, state):
    df_state= slice_state(df, state)
    print('Cumulative test positive rate for the recent 3 days')
    for a in range(3):
        print('%s: %.1f' % (df_state.at[a, 'date'].strftime('%Y-%m-%d'), df_state.at[a, 'total_pos_rate']) + '%')
    plot_test_pos_rate(df_state, state)
    #plot_state_trend(df_state, state, action_index)


# In[8]:


def slice_state(df, state):
    df_state= df.loc[df['state'] == state].copy()
    df_state['total_pos_rate']= df_state['positive']/df_state['total']*100
    df_state['daily_pos_rate']= df_state['positiveIncrease']/df_state['totalTestResultsIncrease']*100
    df_state['date']= pd.to_datetime(df_state['dateChecked'].str.slice(0, 10, 1), format= '%Y-%m-%d')
    df_state.reset_index(inplace= True)
    
    return df_state


# In[9]:


# incomplete
def plot_state_trend(df, state, action_index):
    sns.reset_orig()
    date_form= mdates.DateFormatter("%m-%d")
    markers_on= [0, 1, 2] 
    weekday= SU
    
    # If action_index == 0, plot cumulative test positive rate and daily positive rate & daily test volume
    # If action_index == 1, plot cumulative & new positive cases and cumulative & new deaths
    
    data= {'ax0_variable': ['total_pos_rate', 'positive'],
           'ax1_variable': [np.nan, 'positiveIncrease'],
           'ax2_variable': ['daily_pos_rate', 'death'],
           'ax3_variable': ['totalTestResultsIncrease', 'deathIncrease'],
           'ax0_plot_title': ['Test Positive Rate', 'Positive Cases'],
           'ax2_plot_title': [np.nan, 'Deaths'],
           'ax0_ylabel': ['Cumulative Test Positive Rate (%)', 'Cumulative Cases'],
           'ax1_ylabel': [np.nan, 'New Cases'],
           'ax2_ylabel': ['Daily Test Positive Rate (%)', 'Cumulative Deaths'],
           'ax3_ylabel': ['Daily Test Volume', 'New Deaths']
          }
    action= pd.DataFrame(data, columns= ['ax0_variable', 'ax1_variable', 'ax2_variable', 'ax3_variable',
                                         'ax0_plot_title', 'ax2_plot_title', 'ax0_ylabel', 'ax1_ylabel', 
                                         'ax2_ylabel', 'ax3_ylabel'])
    
    fig0, ax0= plt.subplots(figsize=(8.4, 5))
    plt.plot(df['date'], df[action.at[action_index, 'ax0_variable']], 
             color= 'tab:blue', marker= 'o', markevery= markers_on)
    ax0.fmt_xdata= date_form # mdates.DateFormatter('%m-%d')
    ax0.set(ylabel= action.at[action_index, 'ax0_ylabel'],
            title= state + ' State' + action.at[action_index, 'ax0_plot_title'])
    fig0.autofmt_xdate()    
    ax0.xaxis.set_major_formatter(date_form)
    ax0.xaxis.set_major_locator(mdates.WeekdayLocator(byweekday= weekday)) 
    
    if (isinstance(action.at[action_index, 'ax1_variable'], str)):
        ax1= ax0.twinx()  
        color= 'tab:orange'  
        ax1.plot(df['date'], df[action.at[action_index, 'ax1_variable']], 
                 color= color, marker= 'o', markevery= markers_on)
        ax1.set_ylabel(action.at[action_index, 'ax1_ylabel'], color= color)
        ax1.tick_params(axis='y', labelcolor= color)
        
        color= 'tab:blue'
        ax0.set_ylabel(color= color)
        ax0.tick_params(axis= 'y', labelcolor= color)
    else:
        ax0.grid()
    
    fig1, ax2= plt.subplots(figsize=(8, 5))
    color= 'tab:red'
    ax2.set(xlabel= 'Date')
    ax2.set_ylabel(action.at[action_index, 'ax2_ylabel'], color= color)
    ax2.plot(df['date'], df[action.at[action_index, 'ax2_variable']],
             color= color, marker= 'o', markevery= markers_on)
    ax2.tick_params(axis= 'y', labelcolor= color)
    fig1.autofmt_xdate()    
    ax2.xaxis.set_major_formatter(date_form)
    ax2.xaxis.set_major_locator(mdates.WeekdayLocator(byweekday= weekday))

    if (isinstance(action.at[action_index, 'ax3_variable'], str)):
        ax3= ax2.twinx()  
        color= 'tab:green'
        ax3.set_ylabel(action.at[action_index, 'ax3_ylabel'], color= color)  
        ax3.plot(df['date'], df[action.at[action_index, 'ax3_variable']],
                 color= color, marker= 'o', markevery= markers_on)
        ax3.tick_params(axis='y', labelcolor= color)    
        ax3.xaxis.set_major_formatter(date_form)
        ax3.xaxis.set_major_locator(mdates.WeekdayLocator(byweekday= weekday))
      
    fig1.tight_layout()  # Otherwise the right y-label is slightly clipped
    plt.show()


# In[11]:


def plot_test_pos_rate(df, state):
    sns.reset_orig()
    date_form= mdates.DateFormatter("%m-%d")
    markers_on= [0, 1, 2] 
    weekday= SU
    
    # If action_index == 0, plot cumulative test positive rate and daily positive rate & daily test volume
    # If action_index == 1, plot cumulative & new positive cases and cumulative & new deaths
    
    # no use for now
    data= {'ax0_variable': ['total_pos_rate', 'positive'],
           'ax1_variable': [np.nan, 'positiveIncrease'],
           'ax2_variable': ['daily_pos_rate', 'death'],
           'ax3_variable': ['Daily Test Volume', 'deathIncrease'],
           'ax0_plot_title': ['Test Positive Rate', 'Positive Cases'],
           'ax2_plot_title': [np.nan, 'Deaths'],
           'ax0_ylabel': ['Cumulative Test Positive Rate (%)', 'Cumulative Cases'],
           'ax1_ylabel': [np.nan, 'New Cases'],
           'ax2_ylabel': ['Daily Test Positive Rate (%)', 'Cumulative Deaths'],
           'ax3_ylabel': ['Daily Test Volume', 'New Deaths']
          }
    action= pd.DataFrame(data, columns= ['ax0_variable', 'ax1_variable', 'ax2_variable', 'ax3_variable',
                                        'ax0_plot_title', 'ax2_plot_title', 'ax0_ylabel', 'ax1_ylabel', 
                                        'ax2_ylabel', 'ax3_ylabel'])
    
    fig0, ax0= plt.subplots(figsize=(8.4, 5))
    plt.plot(df['date'], df['total_pos_rate'], color= 'tab:blue', marker= 'o', markevery= markers_on)
    ax0.fmt_xdata= date_form # mdates.DateFormatter('%m-%d')
    ax0.grid()
    ax0.set(ylabel= 'Cumulative Test Positive Rate (%)',
           title= state + ' State COVID-19 Test Positive Rate')
    fig0.autofmt_xdate()    
    ax0.xaxis.set_major_formatter(date_form)
    ax0.xaxis.set_major_locator(mdates.WeekdayLocator(byweekday= weekday))
    
    
    fig1, ax2= plt.subplots(figsize=(8, 5))
    color= 'tab:red'
    ax2.set(xlabel= 'Date')
    ax2.set_ylabel('Daily Test Positive Rate (%)', color= color)
    ax2.plot(df['date'], df['daily_pos_rate'], color= color, marker= 'o', markevery= markers_on)
    ax2.tick_params(axis= 'y', labelcolor= color)   

    ax3= ax2.twinx()  
    color= 'tab:green'
    ax3.set_ylabel('Daily Test Volume', color= color)  
    ax3.plot(df['date'], df['totalTestResultsIncrease'], color= color, marker= 'o', markevery= markers_on)
    ax3.tick_params(axis='y', labelcolor= color)
    fig1.autofmt_xdate()    
    ax3.xaxis.set_major_formatter(date_form)
    ax3.xaxis.set_major_locator(mdates.WeekdayLocator(byweekday= weekday)) 

    fig1.tight_layout()  # Otherwise the right y-label is slightly clipped
    plt.show()
    


# # User Interface

# In[9]:


latest_by_state(df)


# In[12]:


state_pos_rate(df, 'NY')


# In[40]:


state_pos_rate(df, 'CA')

