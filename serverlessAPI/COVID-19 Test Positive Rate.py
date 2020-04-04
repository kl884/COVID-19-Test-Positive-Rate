
# coding: utf-8

# In[3]:


import numpy as np
import pandas as pd
import matplotlib.dates as mdates
from matplotlib.dates import DateFormatter

import matplotlib.pyplot as plt
get_ipython().run_line_magic('matplotlib', 'inline')
import seaborn as sns
from mpl_toolkits.axes_grid1 import make_axes_locatable


# In[69]:


df= pd.read_csv('http://covidtracking.com/api/states/daily.csv')
df.head()


# In[23]:


def state_pos_rate(df, state):
    df_state= slice_state(df, state)
    plot_test_pos_rate(df_state, state)


# In[33]:


def slice_state(df, state):
    df_state= df.loc[df['state'] == state].copy()
    df_state['total_pos_rate']= df_state['positive']/df_state['total']
    df_state['daily_pos_rate']= df_state['positiveIncrease']/df_state['totalTestResultsIncrease']
    df_state['md']= df_state['date']-20200000
    
    return df_state


# In[67]:


def plot_test_pos_rate(df, state):
    sns.reset_orig()
    plt.subplots(figsize=(8.3, 5))

    plt.plot(df['md'], df['total_pos_rate'])
    plt.ylabel('Accumulative Test Positive Rate')
    plt.grid()
    plt.title(state + ' State COVID-19 Test Positive Rate')

    fig, ax1= plt.subplots(figsize=(8, 5))
    color = 'tab:red'
    ax1.set_xlabel('Date')
    ax1.set_ylabel('Daily Test Positive Rate', color= color)
    ax1.plot(df['md'], df['daily_pos_rate'], color= color)
    ax1.tick_params(axis= 'y', labelcolor= color)

    ax2= ax1.twinx()
    ax2.plot(df['md'], df['totalTestResultsIncrease'])
    
    color = 'tab:blue'
    ax2.set_ylabel('Daily Test Volume', color= color)  
    ax2.plot(df['md'], df['totalTestResultsIncrease'], color= color)
    ax2.tick_params(axis='y', labelcolor= color)

    fig.tight_layout()  # Otherwise the right y-label is slightly clipped
    plt.show()
    


# In[68]:


state_pos_rate(df, 'NY')


# In[74]:


state_pos_rate(df, 'CA')

