"""
Time series forecasting for supply chain metrics.

Provides GMV and volume forecasting using linear regression
on historical weekly data patterns.
"""

import pandas as pd
import numpy as np
from datetime import timedelta
from sklearn.linear_model import LinearRegression


class ForecastEngine:
    """Handle time series forecasting"""
    
    def __init__(self, orders_df: pd.DataFrame):
        self.orders_df = orders_df
    
    def forecast_gmv(self, periods: int = 12) -> pd.DataFrame:
        """Forecast GMV using linear regression with confidence intervals"""
        if self.orders_df.empty:
            return pd.DataFrame()
        
        try:
            # Prepare weekly data
            weekly_data = self._prepare_weekly_data('GMV')
            if len(weekly_data) < 2:
                return pd.DataFrame()
            
            # Fit model
            X = weekly_data[['week_num']]
            y = weekly_data['GMV']
            
            model = LinearRegression()
            model.fit(X, y)
            
            # Calculate residual standard error for confidence intervals
            y_pred_historical = model.predict(X)
            residuals = y - y_pred_historical
            mse = np.mean(residuals ** 2)
            std_error = np.sqrt(mse)
            
            # Generate forecasts
            last_week = weekly_data['week_num'].max()
            # Create future_weeks with the same column name as X to avoid feature names warning
            future_weeks_df = pd.DataFrame(np.arange(last_week + 1, last_week + periods + 1), columns=['week_num'])
            future_gmv = model.predict(future_weeks_df)
            
            # Calculate confidence intervals (95%)
            confidence_interval = 1.96 * std_error  # 95% confidence
            upper_bound = future_gmv + confidence_interval
            lower_bound = future_gmv - confidence_interval
            
            # Create forecast DataFrame with historical data
            future_dates = [weekly_data['Week_of_Date'].max() + timedelta(weeks=i+1) for i in range(periods)]
            
            # Combine historical and forecast data
            historical_df = weekly_data[['Week_of_Date', 'GMV']].copy()
            historical_df['Type'] = 'Historical'
            historical_df['Upper_Bound'] = None
            historical_df['Lower_Bound'] = None
            historical_df.rename(columns={'GMV': 'Value'}, inplace=True)
            
            forecast_df = pd.DataFrame({
                'Week_of_Date': future_dates,
                'Value': future_gmv,
                'Type': 'Forecast',
                'Upper_Bound': upper_bound,
                'Lower_Bound': lower_bound
            })
            
            # Ensure both dataframes have the same dtypes before concatenation to avoid FutureWarning
            # Convert Upper_Bound and Lower_Bound to the same dtype in historical_df
            historical_df['Upper_Bound'] = historical_df['Upper_Bound'].astype('float64')
            historical_df['Lower_Bound'] = historical_df['Lower_Bound'].astype('float64')
            
            # Combine historical and forecast
            combined_df = pd.concat([historical_df, forecast_df], ignore_index=True)
            
            return combined_df
        except:
            return pd.DataFrame()
    
    def forecast_volume(self, periods: int = 12) -> pd.DataFrame:
        """Forecast order volume using linear regression with confidence intervals"""
        if self.orders_df.empty:
            return pd.DataFrame()
        
        try:
            # Prepare weekly data for volume
            weekly_data = self._prepare_weekly_data('VOLUME')
            if len(weekly_data) < 2:
                return pd.DataFrame()
            
            # Fit model
            X = weekly_data[['week_num']]
            y = weekly_data['VOLUME']
            
            model = LinearRegression()
            model.fit(X, y)
            
            # Calculate residual standard error for confidence intervals
            y_pred_historical = model.predict(X)
            residuals = y - y_pred_historical
            mse = np.mean(residuals ** 2)
            std_error = np.sqrt(mse)
            
            # Generate forecasts
            last_week = weekly_data['week_num'].max()
            # Create future_weeks with the same column name as X to avoid feature names warning
            future_weeks_df = pd.DataFrame(np.arange(last_week + 1, last_week + periods + 1), columns=['week_num'])
            future_volume = model.predict(future_weeks_df)
            
            # Calculate confidence intervals (95%)
            confidence_interval = 1.96 * std_error  # 95% confidence
            upper_bound = future_volume + confidence_interval
            lower_bound = future_volume - confidence_interval
            
            # Create forecast DataFrame with historical data
            future_dates = [weekly_data['Week_of_Date'].max() + timedelta(weeks=i+1) for i in range(periods)]
            
            # Combine historical and forecast data
            historical_df = weekly_data[['Week_of_Date', 'VOLUME']].copy()
            historical_df['Type'] = 'Historical'
            historical_df['Upper_Bound'] = None
            historical_df['Lower_Bound'] = None
            historical_df.rename(columns={'VOLUME': 'Value'}, inplace=True)
            
            forecast_df = pd.DataFrame({
                'Week_of_Date': future_dates,
                'Value': future_volume,
                'Type': 'Forecast',
                'Upper_Bound': upper_bound,
                'Lower_Bound': lower_bound
            })
            
            # Ensure both dataframes have the same dtypes before concatenation to avoid FutureWarning
            # Convert Upper_Bound and Lower_Bound to the same dtype in historical_df
            historical_df['Upper_Bound'] = historical_df['Upper_Bound'].astype('float64')
            historical_df['Lower_Bound'] = historical_df['Lower_Bound'].astype('float64')
            
            # Combine historical and forecast
            combined_df = pd.concat([historical_df, forecast_df], ignore_index=True)
            
            return combined_df
        except:
            return pd.DataFrame()
    
    def _prepare_weekly_data(self, metric: str) -> pd.DataFrame:
        """Prepare weekly aggregated data for forecasting (excluding December data and incomplete weeks)"""
        try:
            from datetime import datetime, timedelta
            
            df = self.orders_df.copy()
            df['ORDER_DATE'] = pd.to_datetime(df['ORDER_DATE'])
            
            # Exclude December data to avoid incomplete rolling calculations
            df = df[df['ORDER_DATE'].dt.month != 12]
            
            # Determine the cutoff for complete weeks
            # A complete week should end at least 7 days ago from today
            today = pd.Timestamp.now().normalize()
            cutoff_date = today - timedelta(days=7)
            
            # Filter out data from the current incomplete week
            df = df[df['ORDER_DATE'] <= cutoff_date]
            
            df['Week_of_Date'] = df['ORDER_DATE'].dt.to_period('W').dt.start_time
            
            if metric == 'GMV':
                weekly_data = df.groupby('Week_of_Date')['GMV'].sum().reset_index()
                weekly_data.columns = ['Week_of_Date', 'GMV']
            else:  # VOLUME
                weekly_data = df.groupby('Week_of_Date')['ORDER_NUMBER'].nunique().reset_index()
                weekly_data.columns = ['Week_of_Date', 'VOLUME']
            
            weekly_data = weekly_data.sort_values('Week_of_Date')
            
            # Additional check: Remove the last week if it appears incomplete
            # (significantly lower than recent average, indicating partial data)
            if len(weekly_data) >= 4:  # Need at least 4 weeks to calculate
                value_col = 'GMV' if metric == 'GMV' else 'VOLUME'
                last_value = weekly_data[value_col].iloc[-1]
                recent_avg = weekly_data[value_col].iloc[-4:-1].mean()  # Average of 3 weeks before last
                
                # If last week is less than 30% of recent average, consider it incomplete
                if recent_avg > 0 and last_value < (recent_avg * 0.3):
                    weekly_data = weekly_data.iloc[:-1]  # Remove last week
            
            weekly_data['week_num'] = (weekly_data['Week_of_Date'] - weekly_data['Week_of_Date'].min()).dt.days // 7
            
            return weekly_data
        except:
            return pd.DataFrame()
    
