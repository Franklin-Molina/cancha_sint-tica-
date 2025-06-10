import React from 'react';
// No es necesario importar CSS aquí, ya que se importa en DashboardLayout.js

function DashboardOverviewPage() {
  return (
    <> {/* Usar Fragmento para no añadir un div extra si no es necesario */}
    {/*   <h1 className="dashboard-page-title">Dashboard</h1>  */}{/* Usar clase de estilo */}

      {/* Stats */}
      <div className="stats-row">
          <div className="stat-card">
              <div className="stat-header">
                  <div className="stat-title">INGRESOS TOTALES</div>
                  <div className="stat-icon icon-revenue">
                      <i className="fas fa-dollar-sign"></i>
                  </div>
              </div>
              <div className="stat-value">$24,580</div>
              <div className="stat-change">
                  <span className="stat-up"><i className="fas fa-arrow-up"></i> 8.5%</span>
                  desde el mes pasado
              </div>
          </div>

          <div className="stat-card">
              <div className="stat-header">
                  <div className="stat-title">NUEVOS USUARIOS</div>
                  <div className="stat-icon icon-users">
                      <i className="fas fa-users"></i>
                  </div>
              </div>
              <div className="stat-value">1,245</div>
              <div className="stat-change">
                  <span className="stat-up"><i className="fas fa-arrow-up"></i> 12.3%</span>
                  desde el mes pasado
              </div>
          </div>

          <div className="stat-card">
              <div className="stat-header">
                  <div className="stat-title">ÓRDENES</div>
                  <div className="stat-icon icon-orders">
                      <i className="fas fa-shopping-bag"></i>
                  </div>
              </div>
              <div className="stat-value">586</div>
              <div className="stat-change">
                  <span className="stat-down"><i className="fas fa-arrow-down"></i> 3.2%</span>
                  desde el mes pasado
              </div>
          </div>

          <div className="stat-card">
              <div className="stat-header">
                  <div className="stat-title">CRECIMIENTO</div>
                  <div className="stat-icon icon-growth">
                      <i className="fas fa-chart-line"></i>
                  </div>
              </div>
              <div className="stat-value">15.8%</div>
              <div className="stat-change">
                  <span className="stat-up"><i className="fas fa-arrow-up"></i> 5.7%</span>
                  desde el mes pasado
              </div>
          </div>
      </div>

      {/* Charts & Widgets */}
      <div className="widgets-row">
          <div className="widget widget-lg">
              <div className="widget-header">
                  <div className="widget-title">Análisis de Ventas</div>
                  <div className="widget-actions">
                      <i className="fas fa-sync-alt"></i>
                      <i className="fas fa-ellipsis-v"></i>
                  </div>
              </div>
              <div className="widget-content">
                  {/* TODO: Implementar gráfico SVG con React */}
                  <p>Contenido del gráfico de ventas.</p>
              </div>
          </div>

          <div className="widget widget-sm">
              <div className="widget-header">
                  <div className="widget-title">Progreso de Ventas</div>
                  <div className="widget-actions">
                      <i className="fas fa-ellipsis-v"></i>
                  </div>
              </div>
              <div className="widget-content">
                  {/* TODO: Implementar barras de progreso con React */}
                   <p>Contenido de progreso de ventas.</p>
              </div>
          </div>
      </div>

      <div className="widgets-row"> {/* Otra fila para la actividad reciente */}
          <div className="widget widget-sm"> {/* Usar widget-sm para que ocupe la mitad */}
              <div className="widget-header">
                  <div className="widget-title">Actividad Reciente</div>
                  <div className="widget-actions">
                      <i className="fas fa-ellipsis-v"></i>
                  </div>
              </div>
              <div className="widget-content">
                  {/* TODO: Implementar lista de actividad reciente con React */}
                  <p>Contenido de actividad reciente.</p>
              </div>
          </div>
           <div className="widget widget-sm"> {/* Widget placeholder */}
              <div className="widget-header">
                  <div className="widget-title">Otro Widget</div>
                  <div className="widget-actions">
                      <i className="fas fa-ellipsis-v"></i>
                  </div>
              </div>
              <div className="widget-content">
                  <p>Contenido de otro widget.</p>
              </div>
          </div>
      </div>
    </>
  );
}

export default DashboardOverviewPage;
