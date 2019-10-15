let redAI;
let redGlobalSituation;
let redExpansionStrategy;

let creationRoutines  = [];
let creationRoutine1;
//let actionLoop1;
let squad1;
let squadIdCount = 0;

let squads = [];

let standardSquadStrategy;
let defensiveSquadStrategy;
let offensiveSquadStrategy;

let actionsLoops1=[];

let mapAreas = [];
const HORIZONTAL_AREAS = 6;
const VERTICAL_AREAS = 8;

const AI_COUNT_TRESHOLD = 700;

const RIFLE_THREATEN_LEVEL = 1;
const GRENADIER_THREATEN_LEVEL = 2;
const SNIPER_THREATEN_LEVEL = 2;
const SHIELD_THREATEN_LEVEL = 2;

const CONST_1_PTR = 0.2;
const CONST_2_PTR = 0.5;
const CONST_3_PTR = 0.7;
const CONST_4_PTR = 0.9;
const CONST_5_PTR = 1.1;
const CONST_6_PTR = 1.3;
const CONST_7_PTR = 1.5;
const CONST_8_PTR = 1.8;
const CONST_9_PTR = 2.2;
const CONST_10_PTR = 2.8;
const CONST_12_PTR = 3.7;
const CONST_13_PTR = 5;
const CONST_14_PTR = 8;

const MAX_DIST_BETWEEN_SQUAD_MEMBERS = 150;
const MIN_DIST_BETWEEN_SQUAD_MEMBERS = 0.5 * MAX_DIST_BETWEEN_SQUAD_MEMBERS;

const BLUE_SOLDIERS_EVALUATION_RANGE = 200;






class AI
{
    constructor(type, player)
    {
        this.type = type;
        this.player = player;
        this.globalSituation;
        this.expansionStrategy;
        this.AICount =0;
    }

    checkResourcesAndSituationToDetermineIfAndWhatToBuild()
    {
        if(this.AICount >= AI_COUNT_TRESHOLD)
        {
        let rbPointsRatio = this.globalSituation.rbGlobalPointsRatio;
        let z = Math.random();
            if(   neutralResourcesPoints.length > 0     )
            {
                
                if(z < 0.33)
                {
                // spawn basic squads and send them to diff points
                createSquad(creationRoutine1, offensiveSquadStrategy);
                }
                else if ( (z>=0.33) && (z<0.66))
                {
                createSquad(creationRoutine2, offensiveSquadStrategy);    
                }
                else if ( (z>=0.66) && (z<=1))
                {
                createSquad(creationRoutine3, offensiveSquadStrategy);    
                }
                
            }
            else if ((rbPointsRatio != null))
            {
                
                if (rbPointsRatio < 0.2)
                {
                    createSquad(creationRoutine1, defensiveSquadStrategy);//Wait & Regroup in a controlled point and reinforce with basic squads when money is sufficient to make difference
                }
                else if(    (rbPointsRatio >= 0.2)    &&  (rbPointsRatio <0.5)      )
                {
                    createSquad(creationRoutine1, defensiveSquadStrategy); //Same but with more mid squads. spend stance très conservative.
                }
                else if(        (rbPointsRatio >= 0.5) && (rbPointsRatio <0.9)        )
                {
                    createSquad(creationRoutine2, standardSquadStrategy);//Regroup to safe Point, reinforce and then (sometimes) Send basic squads to closest EnemyPoint or (sometimes) a random non occupied enemyPoint. spend stance conservative.
                }
                else if(        (rbPointsRatio >= 0.9) && (rbPointsRatio <1.1)        )
                {
                    createSquad(creationRoutine3, standardSquadStrategy);//Send med squads to closest EnemyPoint or (sometimes) a random enemyPoint. spend stance equilibrée.
                }
                else if(        (rbPointsRatio >= 1.1) && (rbPointsRatio <1.4)        )
                {
                    createSquad(creationRoutine4, standardSquadStrategy);//Send med and high squads to closest EnemyPoint or (sometimes) a random enemyPoint. spend stance dépensière.
                }
                else if(        (rbPointsRatio >= 1.4) && (rbPointsRatio <2)        )
                {
                    createSquad(creationRoutine3, offensiveSquadStrategy);
                    createSquad(creationRoutine4, offensiveSquadStrategy);//Send med and high squads to 2 closest EnemyPoint or (sometimes) a random enemyPoint. spend stance très dépensière.
                }
                else if(        (rbPointsRatio >= 2)       )
                {
                    createSquad(creationRoutine4, offensiveSquadStrategy);
                    createSquad(creationRoutine4, offensiveSquadStrategy);//Send high squads to 2 closest EnemyPoint or (sometimes) a random enemyPoint. spend stance très dépensière.
                }
            }
            this.AICount = 0;
        }
        else
        {
            this.AICount ++;
        }
    }

}

class globalSituation{
    constructor(){

   
    this.type = null;
    this.riskGlobalAttitude = null;
    this.rbGlobalRatio = null;
    this.rbGlobalSoldiersRatio = null;
    this.rbGlobalPointsRatio = null;
    this.rbGlobalPowerRatio = null;
    
    
    }
calculateRatios()
{

    let blueSoldiersPower = 0;
    let redSoldiersPower = 0;
    if((redSoldiers.length > 0) && (blueSoldiers.length > 0))
    {

        this.rbGlobalSoldiersRatio = redSoldiers.length / blueSoldiers.length;
        this.rbGlobalPointsRatio = redResourcesSpots.length / blueResourcesSpots.length;
        
        for(let i =0; i<blueSoldiers.length; i++)
        {
            blueSoldiersPower += blueSoldiers[i].threatLevel;
        }
        for(let j =0; j<redSoldiers.length; j++)
        {
            redSoldiersPower += redSoldiers[j].threatLevel;
        }

        this.rbGlobalPowerRatio = redSoldiersPower / blueSoldiersPower;
        this.rbGlobalRatio = (this.rbGlobalSoldiersRatio + this.rbGlobalPointsRatio + this.rbGlobalPowerRatio) / 3;

    }
}


}
class mapArea{
    constructor()
    {
        this.topLeft = {};
        this.bottomRight = {};
        //this.rbSoldierRatio;
        this.resourcesPointsOnArea = [];
        this.soldiersOnArea = [];
        this.basesOnArea = [];
    }
    checkIfRedPointIsAttackedAndReturnAttackers()
    {   
        let blueAttackers = [];
        
        if(this.resourcesPointsOnArea.length > 0)
        {
            
            for(let i = 0; i < this.resourcesPointsOnArea.length; i++)
            {
                
                if(this.resourcesPointsOnArea[i].player.color == "red")
                {
                        blueAttackers.push(findBluePlayersAround(this.resourcesPointsOnArea[i], BLUE_SOLDIERS_EVALUATION_RANGE));   
                }

            }
            if ( blueAttackers.length > 0)
            {
                
                return blueAttackers;
                
            }
            else
            {
                return null;
            }
        }
        else
        {
            return null;
        }
        
    }
    getResourcesOnMapArea()
    {
        for(let i =0; i<resourcesSpots.length; i++)
        {
            if((resourcesSpots[i].status.x >= this.topLeft.x) && (resourcesSpots[i].status.x < this.bottomRight.x))
            {
                if((resourcesSpots[i].status.y >= this.topLeft.y) && (resourcesSpots[i].status.y < this.bottomRight.y))
                {
                   this.resourcesPointsOnArea.push(resourcesSpots[i]);
                }
            }
        }
    }


    getSoldiersOnMapArea()
    {
        for(let i =0; i<soldiers.length; i++)
        {
            if((soldiers[i].status.x >= this.topLeft.x) && (soldiers[i].status.x < this.bottomRight.x))
            {
                if((soldiers[i].status.y >= this.topLeft.y) && (soldiers[i].status.y < this.bottomRight.y))
                {
                   this.soldiersOnArea.push(soldiers[i]);
                }
            }
        }
    }

    getBasesOnMapArea()
    {
        for(let i =0; i<buildings.length; i++)
        {
            if((buildings[i].status.x >= this.topLeft.x) && (buildings[i].status.x < this.bottomRight.x))
            {
                if((buildings[i].status.y >= this.topLeft.y) && (buildings[i].status.y < this.bottomRight.y))
                {
                   this.basesOnArea.push(buildings[i]);
                }
            }
        }
    }

    clearSoldiersOnMapArea()
    {
        this.soldiersOnArea = [];
    }

    clearBasesOnMapArea()
    {
        this.basesOnArea = [];
    }
}
class powerLevel{
    constructor()
    {
        this.overallGeneral;
        this.overallDps;
        this.overallSpeed;
        this.overallRange;
        this.overallDefense;
    }
}
class squad{
    constructor()
    {
        this.type;
        this.id;
        this.squadMembersRelativePositionOffsets = [];
        this.squadMembers = [];
        this.squadStrategy;
        this.powerLevel;
        this.threatenedLevel = 0;
        
        this.isEnemyDetectedAround = false;
    }
    /* threatenedLevelEstimation()
    {this.
        this.threatenedLevel = 0;
        if(this.isEnemyDetectedAround)
        {
            this.threatenedLevel++;
        }

    } */

    findMostVulnerableRedPoint()
    {
        
    }
    getPowerLevel()
    {
        this.powerLevel.overallGeneral = 0;
        for(let i=0; i<this.squadMembers.length; i++)
        {
            if(this.squadMembers[i].type == "rifleman")
            {
                this.powerLevel.overallGeneral += RIFLE_THREATEN_LEVEL;
            }
            else if(this.squadMembers[i].type == "grenadier")
            {
                this.powerLevel.overallGeneral += GRENADIER_THREATEN_LEVEL;
            }
            else if(this.squadMembers[i].type == "sniper")
            {
                this.powerLevel.overallGeneral += SNIPER_THREATEN_LEVEL;
            }
            else if(this.squadMembers[i].type == "shield")
            {
                this.powerLevel.overallGeneral += SHIELD_THREATEN_LEVEL;
            }
            
        }
        return this.powerLevel;
    }
    applyGlobalStrategy()
    {
        if(this.squadStrategy.type == "standard")
        {
            if(this.findClosestNeutralPoint() != null)
            {
                this.moveToPoint(this.findClosestNeutralPoint());
            }
            else if (this.findClosestEnemyPoint() != null)
            {
                this.moveToPoint(this.findClosestEnemyPoint());
            }
            else if (this.findClosestOccupiedEnemyPoint() != null)
            {
                this.moveToPoint(this.findClosestOccupiedEnemyPoint());
            }
            else if (this.findClosestEnemy() != null)
            {
                this.moveToPoint(this.findClosestEnemy());
            }
            else
            {
                this.moveToPoint(blueBase);
            }
        }
        else if (this.squadStrategy.type == "offensive")
        {
            let step1 =false;
            for(let j = 0; j < this.squadMembers.length; j++)
            {
                    if((this.squadMembers[j].status.isUnderFire == true)        &&          (this.squadMembers[j].status.isFighting == false))
                    {
                        if(this.squadMembers[j].weapon != null)
                        {
                            let closestEnemy = this.findClosestEnemy();
                        let z= Math.hypot(this.squadMembers[j].status.x - closestEnemy.status.x, this.squadMembers[j].status.y - closestEnemy.status.y);
                            if(    (z > this.squadMembers[j].weapon.range)    && (closestEnemy != null)  )
                            {
                                this.squadMembers[j].moveTo(closestEnemy.status.x, closestEnemy.status.y  )
                                step1 = true;
                            }
                        }
                    }
            }

           
             if (  (step1==false)  &&   (this.findClosestEnemy() != null)       )
            {
                this.moveToPoint(this.findClosestEnemy());
            }
            else if( (step1==false)  &&   (this.findClosestEnemy() == null))
            {
                this.moveToPoint(blueBase);
            }

            
        }
        else if (this.squadStrategy.type == "defensive")
        {
            let attackedRedPoints = checkIfAllRedPointsAreAttackedAndReturnAttackedPointsArray();
            if(attackedRedPoints != null)
            {
                for(let i = 0; i< attackedRedPoints.length; i++)
                {
                    if(findBluePlayersAround(attackedRedPoints[i], BLUE_SOLDIERS_EVALUATION_RANGE) != null)
                    {
                        if(findBluePlayersAround(attackedRedPoints[i], BLUE_SOLDIERS_EVALUATION_RANGE).length <= this.squadMembers.length)
                        {
                            this.moveToPoint(attackedRedPoints[i]);
                        }
                        else
                        {
                            this.findMostVulnerableFriendPoint();
                        }
                    }
                }
            }
            else
            {
                for(let j = 0; j < this.squadMembers.length; j++)
                {
                    if((this.squadMembers[j].status.isUnderFire == true)        &&          (this.squadMembers[j].status.isFighting == false))
                    {
                        if(this.squadMembers[j].weapon != null)
                        {
                            let closestEnemy = this.findClosestEnemy();
                        let z= Math.hypot(this.squadMembers[j].status.x - closestEnemy.status.x, this.squadMembers[j].status.y - closestEnemy.status.y);
                            if(    z > this.squadMembers[j].weapon.range   )
                            {
                                this.moveToPoint(closestEnemy.status.x, closestEnemy.status.y  )
                            }
                        }
                    }
                }

            }
            
        }
    }

        /* let neutralPointDetected = false;
    for(let i = 0; i<squads.length; i++)
    {
        if(squads[i].findClosestNeutralPoint())
        {
            squads[i].moveToPoint(squads[i].findClosestNeutralPoint());
            neutralPointDetected = true;
        }
        
        
    }
    if(neutralPointDetected == false)
    {
        return null;
    }
    else
    {
        return true;
    } */
    
    checkSquadMembersHp()
    {
        for(let i = this.squadMembers.length -1; i >= 0; i--)
        {
            if(this.squadMembers[i].hp <= 0)
            {
                this.squadMembers.splice(this.squadMembers[i], 1);
            }
        }
        
        /* if(this.squadMembers.length <= 0)
        {
            squads.splice(this, 1);
        } */
    }

    findClosestEnemy()
    {
        let temp = null;
        for( let i = 0; i < blueSoldiers.length; i++)
        {
            let z = Math.hypot(blueSoldiers[i].status.x - this.squadMembers[0].status.x, blueSoldiers[i].status.y - this.squadMembers[0].status.y);
                    if(          (temp == null)     ||     (z < Math.hypot(this.squadMembers[0].status.x - temp.status.x, this.squadMembers[0].status.y - temp.status.y))        ) 
                    {
                        temp = blueSoldiers[i];
                    }
        }
        if(temp != null)
        {
            return temp;
        }
        else
        {
            return null
        }
    }
    checkThreatenedLevel()
    {
        // check this.powerLevel;
        let powerThreatRatio;
        powerThreatRatio = this.powerLevel.overallGeneral / this.threatenedLevel.overallGeneral;
        if(     (powerThreatRatio < CONST_1_PTR)    )
        {
                // RUN AWAY
        }
        else if(     (powerThreatRatio >= CONST_1_PTR) && (powerThreatRatio < CONST_2_PTR)    )
        {

        }
        else if(     (powerThreatRatio >= CONST_2_PTR) && (powerThreatRatio < CONST_3_PTR)    )
        {

        }
        else if(     (powerThreatRatio >= CONST_3_PTR) && (powerThreatRatio < CONST_4_PTR)    )
        {

        }
        else if(     (powerThreatRatio >= CONST_4_PTR) && (powerThreatRatio < CONST_5_PTR)    )
        {

        }
        
        else if(     (powerThreatRatio >= CONST_5_PTR) && (powerThreatRatio < CONST_6_PTR)    )
        {

        }
        else if(     (powerThreatRatio >= CONST_6_PTR) && (powerThreatRatio < CONST_7_PTR)    )
        {
            
        }
        else if(     (powerThreatRatio >= CONST_7_PTR) && (powerThreatRatio < CONST_8_PTR)    )
        {

        }
        else if(     (powerThreatRatio >= CONST_8_PTR) && (powerThreatRatio < CONST_9_PTR)    )
        {

        }
        else if(     (powerThreatRatio >= CONST_9_PTR) && (powerThreatRatio < CONST_10_PTR)    )
        {

        }
        else if(     (powerThreatRatio >= CONST_10_PTR) && (powerThreatRatio < CONST_11_PTR)    )
        {

        }
        else if(     (powerThreatRatio >= CONST_11_PTR) && (powerThreatRatio < CONST_12_PTR)    )
        {
                //CRUSH THEM ALL
        }
    }
    updateThreatenedLevel()
    {
        this.threatenedLevel = 0;
        this.isEnemyDetectedAround = false;
        let nbrOfEnemiesDetected = 0;
        for(let i = 0; i < soldiers.length; i++)
        {
                let z = Math.hypot(soldiers[i].status.x - this.squadMembers[0].status.x, soldiers[i].status.y - this.squadMembers[0].status.y);
                    if(((z <= AI_SQUAD_REACTION_RANGE) && (z>=0)) || ((z>= AI_SQUAD_REACTION_RANGE) && (z < 0)))
                    {
                        this.isEnemyDetectedAround = true;
                        
                            
                        for(let j =0; j < soldiers.lenght; j++)
                        {
                            if(soldiers[j].player.color == "blue")
                            {
                            let zz = Math.hypot(soldiers[j].status.x - soldiers[i].status.x, soldiers[j].status.y - soldiers[i].status.y);
                                if(((zz <= AI_SQUAD_REACTION_RANGE_SEEKFORALLIEDENEMIES) && (zz>=0)) || ((zz>= AI_SQUAD_REACTION_RANGE_SEEKFORALLIEDENEMIES) && (zz < 0)))
                                {
                                    nbrOfEnemiesDetected++;
                                    if(soldiers[j].type == "rifle")
                                    {
                                        this.threatenedLevel += RIFLE_THREATEN_LEVEL;
                                    }
                                    else if(soldiers[j].type == "grenadier")
                                    {
                                        this.threatenedLevel += GRENADIER_THREATEN_LEVEL;
                                    }
                                    else if(soldiers[j].type == "sniper")
                                    {
                                        this.threatenedLevel += SNIPER_THREATEN_LEVEL;
                                    }
                                    else if(soldiers[j].type == "shield")
                                    {
                                        this.threatenedLevel += SHIELD_THREATEN_LEVEL;
                                    }
                                }
                            }
                        }
                    }
        }
        /* if(this.isEnemyDetectedAround == true)
        {
            
            //check power around that unit vs this squad (and around) + check global situation + check resourcePointStatus if close to targets
        } */
        
    }

    checkIfEngagedReturnThreatenedLevel()
    {
        let isSquadEngaged = false;
        for(let i=0; i<this.squadMembers[i].length; i++)
        {
            if(this.squadMembers[i].status.isUnderFire == true)
            {
                isSquadEngaged = true;
            }
        }
        if(isSquadEngaged == true)
        {
            return this.threatenedLevel;
        }
        else
        {
            return null;
        }
    }
    moveToPoint(point)
    {
        for(let i=0; i<this.squadMembers.length; i++)
        {
            if((this.squadMembers[i].status.destx == null) || (this.squadMembers[i].status.destY == null))
            {
            this.squadMembers[i].status.destX = point.status.x;
            this.squadMembers[i].status.destY = point.status.y;
            }
        }
    }
findClosestNeutralPoint()
{
    let closestSecuredNeutralPoint;
    let closestSafePoint;
    let dangerousNeutralPoints = [];
    let safePoints = [];
    let occupiedByAlliesPoints = [];
    let contestedNeutralPoints = [];
    let occupiedByItselfPoints = [];
    
    if(this.checkSquadCohesion() == true)
    {
        if(neutralResourcesPoints.length > 0)
        {
            for( let i = 0; i < neutralResourcesPoints.length; i++)
            {
                
               
               if(   (findBluePlayersAround(neutralResourcesPoints[i], BLUE_SOLDIERS_EVALUATION_RANGE)) == null)  
               {    
                   if(              (findRedPlayersAround(neutralResourcesPoints[i], CAP_RANGE + 30)) == null           )               
                   {
                        safePoints.push(neutralResourcesPoints[i]);   
                        
                   }
                   else
                   {

                        if(   (findRedPlayersAround(neutralResourcesPoints[i], CAP_RANGE + 30)) != null)
                        {
                                if(            (findRedPlayersAround(neutralResourcesPoints[i], CAP_RANGE+30))[0].squad.id === this.id)
                                {
                                
                                    safePoints.push(neutralResourcesPoints[i]);
                                }
                                else
                                {
                                    
                                }
                        }  
                    }
               }  
            }   
              
        

            if(safePoints != [])
            {
            let temp = null;
                for(let l= 0; l< safePoints.length; l++)
                {
                let z = Math.hypot(this.squadMembers[0].status.x - safePoints[l].status.x, this.squadMembers[0].status.y - safePoints[l].status.y);
                    if((temp == null) || ((z < Math.hypot(this.squadMembers[0].status.x - temp.status.x, this.squadMembers[0].status.y - temp.status.y)) &&(z>0)) || ((z > Math.hypot(this.squadMembers[0].status.x - temp.status.x, this.squadMembers[0].status.y - temp.status.y)) &&(z<0)))
                    {
                        temp = safePoints[l];
                    }
                }
                if(temp != null)
                {
                    closestSafePoint = temp;
                    
                }
                return closestSafePoint;
            }
        }
        else
        {
            return null;
        }
    }
    else
    {
        return null;
    }   
        
} /*    
findClosestNeutralPoint_OLD()
{
    /* if(this.checkSquadCohesion() == true)
    {
        if(neutralResourcesPoints.length > 0)
        {
            for( let i = 0; i < neutralResourcesPoints; i++)
            {
                find
            }
        }
    } 
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
     if(this.checkSquadCohesion() == true)
    {

        
        let closestSafePoint = null;
        let safePoints = [];
        let populatedByFriends = null;


            for(let i=0; i<mapAreas.length; i++)
            {
                if(mapAreas[i].resourcesPointsOnArea != [])
                {
                    
                    for(let j = 0; j < mapAreas[i].resourcesPointsOnArea.length; j++)
                    {
                        if( mapAreas[i].resourcesPointsOnArea[j].player.color == "black" )
                        {    
                            for(let k =0; k<=mapAreas[i].soldiersOnArea.length; k++)
                            {
                                if (mapAreas[i].soldiersOnArea.length == 0)
                                {   
                                    let safePoint = mapAreas[i].resourcesPointsOnArea[j];
                                    safePoints.push(safePoint);
                                }
                                else if(mapAreas[i].soldiersOnArea.length != 0) //&& (mapAreas[i].soldiersOnArea[k].player.color != "blue"))
                                {
                                    for(let m=0; m< mapAreas[i].soldiersOnArea.length; m++)
                                    {
                                        if(mapAreas[i].soldiersOnArea[m].player.color == "red")
                                        {
                                            populatedByFriends = mapAreas[i].resourcesPointsOnArea[j];
                                            //let safePoint = mapAreas[i].resourcesPointsOnArea[j];
                                            //safePoints.push(safePoint);
                                        }
                                        else if(mapAreas[i].soldiersOnArea[m].player.color == "blue")
                                        {

                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        
        if(safePoints != [])
        {
            let temp = null;
            for(let l= 0; l< safePoints.length; l++)
            {
                let z = Math.hypot(this.squadMembers[0].status.x - safePoints[l].status.x, this.squadMembers[0].status.y - safePoints[l].status.y);
                if((temp == null) || ((z < Math.hypot(this.squadMembers[0].status.x - temp.status.x, this.squadMembers[0].status.y - temp.status.y)) &&(z>0)) || ((z > Math.hypot(this.squadMembers[0].status.x - temp.status.x, this.squadMembers[0].status.y - temp.status.y)) &&(z<0)))
                {
                    temp = safePoints[l];
                }
            }
            if(temp != null)
            {
                closestSafePoint = temp;
                
            }
            return closestSafePoint;
        }
        else if (populatedByFriends != null)
        {
            closestSafePoint = populatedByFriends;
        }
    }
    else
    {
        return false;
    } 
}
 */

 findClosestEnemyPoint()
 {
    let closestSecuredNeutralPoint;
    let closestEnemyPoint;
    let dangerousEnemyPoints = [];
    let enemyPoints = [];
    let occupiedByAlliesPoints = [];
    let contestedNeutralPoints = [];
    let occupiedByItselfPoints = [];
    
    if(this.checkSquadCohesion() == true)
    {
        if(blueResourcesSpots.length > 0)
        {
            for( let i = 0; i < blueResourcesSpots.length; i++)
            {
                
               
               if(   (findBluePlayersAround(blueResourcesSpots[i], BLUE_SOLDIERS_EVALUATION_RANGE)) == null)  
               {    
                   
                  enemyPoints.push(blueResourcesSpots[i]);         
               }   
               else 
               {
                   dangerousEnemyPoints.push(blueResourcesSpots[i]);
               }    
            }  
           
            if(enemyPoints != [])
            {
            let temp = null;
                for(let l= 0; l< enemyPoints.length; l++)
                {
                let z = Math.hypot(this.squadMembers[0].status.x - enemyPoints[l].status.x, this.squadMembers[0].status.y - enemyPoints[l].status.y);
                    if((temp == null) || ((z < Math.hypot(this.squadMembers[0].status.x - temp.status.x, this.squadMembers[0].status.y - temp.status.y)) &&(z>0)) || ((z > Math.hypot(this.squadMembers[0].status.x - temp.status.x, this.squadMembers[0].status.y - temp.status.y)) &&(z<0)))
                    {
                        temp = enemyPoints[l];
                    }
                }
                if(temp != null)
                {
                    closestEnemyPoint = temp;
                    
                }
                return closestEnemyPoint;
            }
        }
        else
        {
            return null;
        }
    }
    else
    {
        return null;
    }   
 }

 findClosestOccupiedEnemyPoint()
 {
    let closestSecuredNeutralPoint;
    let closestEnemyPoint;
    let dangerousEnemyPoints = [];
    let enemyPoints = [];
    let occupiedByAlliesPoints = [];
    let contestedNeutralPoints = [];
    let occupiedByItselfPoints = [];
    
    if(this.checkSquadCohesion() == true)
    {
        if(blueResourcesSpots.length > 0)
        {
            for( let i = 0; i < blueResourcesSpots.length; i++)
            {
                  enemyPoints.push(blueResourcesSpots[i]);         
            }  
           
            if(enemyPoints != [])
            {
            let temp = null;
                for(let l= 0; l< enemyPoints.length; l++)
                {
                let z = Math.hypot(this.squadMembers[0].status.x - enemyPoints[l].status.x, this.squadMembers[0].status.y - enemyPoints[l].status.y);
                    if((temp == null) || ((z < Math.hypot(this.squadMembers[0].status.x - temp.status.x, this.squadMembers[0].status.y - temp.status.y)) &&(z>0)) || ((z > Math.hypot(this.squadMembers[0].status.x - temp.status.x, this.squadMembers[0].status.y - temp.status.y)) &&(z<0)))
                    {
                        temp = enemyPoints[l];
                    }
                }
                if(temp != null)
                {
                    closestEnemyPoint = temp;
                    
                }
                return closestEnemyPoint;
            }
        }
        else
        {
            return null;
        }
    }
    else
    {
        return null;
    }   
 }
findClosestEnemyPoint_OLD()
{
    if(this.checkSquadCohesion() == true)
        {

        
        let closestEnemyPoint = null;
        let enemyPoints = [];


            for(let i=0; i<mapAreas.length; i++)
            {
                if(mapAreas[i].resourcesPointsOnArea != [])
                {
                    
                    for(let j = 0; j < mapAreas[i].resourcesPointsOnArea.length; j++)
                    {
                        if( mapAreas[i].resourcesPointsOnArea[j].player.color == "blue" )
                        {    
                            for(let k =0; k<=mapAreas[i].soldiersOnArea.length; k++)
                            {
                                if (mapAreas[i].soldiersOnArea.length == 0)
                                {   
                                    let enemyPoint = mapAreas[i].resourcesPointsOnArea[j];
                                    enemyPoints.push(enemyPoint);
                                }
                                else if(mapAreas[i].soldiersOnArea.length != 0) //&& (mapAreas[i].soldiersOnArea[k].player.color != "blue"))
                                {
                                    let preferedDest = false;
                                    let alternateDest;
                                     for(let m=0; m< mapAreas[i].soldiersOnArea.length; m++)
                                    { 
                                        

                                        if(mapAreas[i].soldiersOnArea[m].player.color == "red")
                                        {
                                            
                                            let enemyPoint = mapAreas[i].resourcesPointsOnArea[j];
                                            enemyPoints.push(enemyPoint);
                                            preferedDest = true;
                                        }
                                        else if (mapAreas[i].soldiersOnArea[m].player.color == "blue")
                                        {
                                            alternateDest = mapAreas[i].resourcesPointsOnArea[j];// decide to attack or not power vs power
                                        }
                                    }
                                    if (preferedDest == false)
                                    {
                                        // decide if we attack the occupied point. Determine power vs power  AND check around each squad to see possible reinforcements
                                    }
                                }
                            }
                        }
                    }
                }
            }
        
        if(enemyPoints != [])
        {
            let temp = null;
            for(let l= 0; l< enemyPoints.length; l++)
            {
                let z = Math.hypot(this.squadMembers[0].status.x - enemyPoints[l].status.x, this.squadMembers[0].status.y - enemyPoints[l].status.y);
                if((temp == null) || ((z < Math.hypot(this.squadMembers[0].status.x - temp.status.x, this.squadMembers[0].status.y - temp.status.y)) &&(z>0)) || ((z > Math.hypot(this.squadMembers[0].status.x - temp.status.x, this.squadMembers[0].status.y - temp.status.y)) &&(z<0)))
                {
                    temp = enemyPoints[l];
                }
            }
            if(temp != null)
            {
                closestEnemyPoint = temp;
                
            }
            return closestEnemyPoint;
        }
        }
        else
    {
        return false;
    }
}




    checkSquadCohesion()
    {   
        let isSquadCohesionOK = true;
        
        for(let i = 0; i < this.squadMembers.length; i++)
        {   
            if(this.squadMembers[i] != this.squadMembers[0])
            {
                let z = Math.hypot(this.squadMembers[0].status.x - this.squadMembers[i].status.x, this.squadMembers[0].status.y - this.squadMembers[i].status.y);
                if ( (  (z > MAX_DIST_BETWEEN_SQUAD_MEMBERS) && (z>0) )      ||    (   (z<MAX_DIST_BETWEEN_SQUAD_MEMBERS) && (z<0) ) )
                {
                    this.squadMembers[i].status.destX = this.squadMembers[0].status.x;
                    this.squadMembers[i].status.destY = this.squadMembers[0].status.y;

                    //this.squadMembers[0].status.destX = null;
                    //this.squadMembers[0].status.destY = null;
                    
                    isSquadCohesionOK = false;
                } 
                /* if(     (        (  (z < MAX_DIST_BETWEEN_SQUAD_MEMBERS) && (z>0) )      ||    (   (z > MAX_DIST_BETWEEN_SQUAD_MEMBERS) && (z<0) )         )               &&                    (  (z > MIN_DIST_BETWEEN_SQUAD_MEMBERS) && (z>0) )      ||    (   (z < MIN_DIST_BETWEEN_SQUAD_MEMBERS) && (z<0) )     )
                {
                    
                    
                }
                else if ( (  (z > MAX_DIST_BETWEEN_SQUAD_MEMBERS) && (z>0) )      ||    (   (z<MAX_DIST_BETWEEN_SQUAD_MEMBERS) && (z<0) ) )
                {
                    this.squadMembers[i].status.destX = this.squadMembers[0].status.x;
                    this.squadMembers[i].status.destY = this.squadMembers[0].status.y;

                    //this.squadMembers[0].status.destX = null;
                    //this.squadMembers[0].status.destY = null;
                    
                    isSquadCohesionOK = false;
                } */
            }
        }
        return isSquadCohesionOK;
    }


    
}


class squadStrategy{
    constructor(){
        this.type;
        this.actualStrategy;
    }
    /* findActionLoopDest()
    {
        thisSquadPowerLevel = this.squad.powerLevel;

    } */
}
class creationRoutine{
    constructor(unitsToBuild, pros, cons)
    {
        this.type = "basic";
        this.costLevel;
        this.powerLevel;
        this.unitsToBuild = unitsToBuild;
        this.squadMembers = [];
        this.squadStrategy;
        //this.squadActionsLoops = squadActionLoops;
        
        this.pros = pros;
        this.cons = cons;
    }
}
/* class actionLoop{
    constructor(){
        this.squad = [];
        this.targetDest = {};
    }
    
    executeActionLoop()
    {
        for(let i=0; i<this.squad.squadMembers.length; i++)
        {
            this.squad.squadMembers[i].status.destX = this.targetDest.x; //+ this.squad.squadMembersRelativePositionOffsets[i].x;
            this.squad.squadMembers[i].status.destY = this.targetDest.y;// + this.squad.squadMembersRelativePositionOffsets[i].y;

        }
    }
} */
class expansionStrategy{
    constructor()
    {
        this.type = null;
        this.favouriteRoutines = [];
    }
}
function createSquad(creationRoutine, squadStrategy)
{   
    squad1 = new squad();
    squad1.type = creationRoutine.type;
    
    squad1.squadActionsLoops = creationRoutine.squadActionsLoops;
    //actionLoop1.squad = squad1;
    if(redPlayer.money >= creationRoutine.costLevel)
    {

    
        for(let i= 0; i<creationRoutine.unitsToBuild.length; i++)
        {   
        
            if(creationRoutine.unitsToBuild[i] == "rifleman")
            {
                if(redPlayer.money >= RIFLEMAN_COST)
                {
                let redRifle = new weapon("rifle", null, null, RIFLEMAN_RANGE, RIFLEMAN_DMG, RIFLEMAN_RATE_OF_FIRE, shooting_png, under_fire_png, true, 0);
                let redRifleman = new soldier(redPlayer, "rifleman", rifle_red_png, RIFLEMAN_HP, RIFLEMAN_SPEED, redRifle, null, 0, RIFLE_THREATEN_LEVEL);
                redRifle.soldier = redRifleman;
                let statusRedRifleman = new status(false, false, true, false, false, redBase.baseSlots.slot1.x, redBase.baseSlots.slot1.y, null, null );
                redRifleman.status = statusRedRifleman;
                redPlayer.money -= RIFLEMAN_COST;
                redRifleman.squad = squad1;

                squad1.squadMembers.push(redRifleman);
                soldiers.push(redRifleman);
                weapons.push(redRifle);
                }
            }
        
            if(creationRoutine.unitsToBuild[i] == "grenadier")
            {
                if(redPlayer.money >= GRENADIER_COST)
                {
                let redGrenades = new weapon("grenades", null, null, GRENADIER_RANGE, null, null, shooting_png, under_fire_png, true, 0);
                let redGrenadier = new soldier(redPlayer, "grenadier", grenade_red_png, GRENADIER_HP, GRENADIER_SPEED, redGrenades, null, 0, GRENADIER_THREATEN_LEVEL );
                
                redGrenades.soldier = redGrenadier;
                let statusRedGrenadier = new status(false, false, true, false, false, redBase.baseSlots.slot1.x, redBase.baseSlots.slot1.y, null, null );
                redGrenadier.status = statusRedGrenadier;
                redPlayer.money -= GRENADIER_COST;
                redGrenadier.squad = squad1;

                squad1.squadMembers.push(redGrenadier);
                soldiers.push(redGrenadier);
                weapons.push(redGrenades);
                }
            }

            if(creationRoutine.unitsToBuild[i] == "sniper")
            {
                if(redPlayer.money >= SNIPER_COST)
                {
                let redSniperWeapon = new weapon("sniper", null, null, SNIPER_RANGE, SNIPER_DMG, null, shooting_png, under_fire_png, true, 0);
                let redSniper = new soldier(redPlayer, "sniper", sniper_red_png, SNIPER_HP, SNIPER_SPEED, redSniperWeapon, null, 0, SNIPER_THREATEN_LEVEL);
                redSniperWeapon.soldier = redSniper;
                let statusRedSniper = new status(false, false, true, false, false, redBase.baseSlots.slot1.x, redBase.baseSlots.slot1.y, null, null );
                redSniper.status = statusRedSniper;
                redPlayer.money -= SNIPER_COST;
                redSniper.squad = squad1;

                squad1.squadMembers.push(redSniper);
                soldiers.push(redSniper);
                weapons.push(redSniperWeapon);
                }
            }

            if(creationRoutine.unitsToBuild[i] == "shieldman")
            {
                    if(redPlayer.money >= SHIELD_COST)
                    {
                    let redShieldman = new soldier(redPlayer, "shieldman", shield_red_png, SHIELDMAN_HP, SHIELDMAN_SPEED, null, null, nbrCount+1, SHIELD_THREATEN_LEVEL);
                    let redShield = new shield(redShieldman);
                    redShieldman.shield = redShield;
                    statusRedShieldman = new status(false, false, true, false, false, redBase.baseSlots.slot1.x, redBase.baseSlots.slot1.y, null, null );
                    redShieldman.status = statusRedShieldman;
                    redPlayer.money -= SHIELD_COST;
                    redShieldman.squad = squad1;

                    squad1.squadMembers.push(redShieldman);
                    soldiers.push(redShieldman); 
                    }
            }
        
            
        }
        squad1.powerLevel = creationRoutine.powerLevel;
        squad1.id = squadIdCount;
        squadIdCount++;
        squad1.squadStrategy = squadStrategy;
        squads.push(squad1);
    
    
    }

    

    
}

function createRoutine1()
{
let unitsToBuild = ["rifleman", "rifleman"];
creationRoutine1 = new creationRoutine(unitsToBuild, null, null );

let powerLevel1 = new powerLevel();
powerLevel1.overallGeneral = RIFLE_THREATEN_LEVEL + RIFLE_THREATEN_LEVEL;
creationRoutine1.powerLevel = powerLevel1;
creationRoutine1.costLevel = RIFLEMAN_COST + RIFLEMAN_COST;
//creationRoutine1.powerLevel = RIFLE_THREATEN_LEVEL + RIFLE_THREATEN_LEVEL + RIFLE_THREATEN_LEVEL;

creationRoutines.push(creationRoutine1);
}
function createRoutine2()
{
let unitsToBuild = ["grenadier", "rifleman", "rifleman"];
creationRoutine2 = new creationRoutine(unitsToBuild, null, null );

let powerLevel2 = new powerLevel();
powerLevel2.overallGeneral = GRENADIER_THREATEN_LEVEL + RIFLE_THREATEN_LEVEL + RIFLE_THREATEN_LEVEL;
creationRoutine2.powerLevel = powerLevel2;
creationRoutine2.costLevel = GRENADIER_COST + RIFLEMAN_COST + RIFLEMAN_COST;
//creationRoutine2.powerLevel = GRENADIER_THREATEN_LEVEL + RIFLE_THREATEN_LEVEL + RIFLE_THREATEN_LEVEL;

creationRoutines.push(creationRoutine2);
}
function createRoutine3()
{
    let unitsToBuild = ["sniper", "rifleman", "rifleman"];
    creationRoutine3 = new creationRoutine(unitsToBuild, null, null );
    let powerLevel3 = new powerLevel();
    powerLevel3.overallGeneral = SNIPER_THREATEN_LEVEL + RIFLE_THREATEN_LEVEL + RIFLE_THREATEN_LEVEL;
    creationRoutine3.powerLevel = powerLevel3;
    creationRoutine3.costLevel = SNIPER_COST + RIFLEMAN_COST + RIFLEMAN_COST;
    //creationRoutine3.powerLevel = GRENADIER_THREATEN_LEVEL + SNIPER_THREATEN_LEVEL + RIFLE_THREATEN_LEVEL + RIFLE_THREATEN_LEVEL;

    creationRoutines.push(creationRoutine3);
}
function createRoutine4()
{
    let unitsToBuild = ["shield", "sniper", "rifleman", "rifleman"];
    creationRoutine4 = new creationRoutine(unitsToBuild, null, null );
    let powerLevel4 = new powerLevel();
powerLevel4.overallGeneral = SHIELD_THREATEN_LEVEL + SNIPER_THREATEN_LEVEL + RIFLE_THREATEN_LEVEL + RIFLE_THREATEN_LEVEL;
creationRoutine4.powerLevel = powerLevel4;
    creationRoutine4.costLevel = SHIELD_COST + SNIPER_COST + RIFLEMAN_COST + RIFLEMAN_COST;
    //creationRoutine4.powerLevel = SHIELD_THREATEN_LEVEL + SNIPER_THREATEN_LEVEL + RIFLE_THREATEN_LEVEL + RIFLE_THREATEN_LEVEL + RIFLE_THREATEN_LEVEL;

    creationRoutines.push(creationRoutine4);
}



function createRedAI()
{
    redAI = new AI("standard", redPlayer);

    redGlobalSituation = new globalSituation();
    redAI.globalSituation = redGlobalSituation;

    redExpansionStrategy = new expansionStrategy();
    redAI.expansionStrategy = redExpansionStrategy;
}

function createMapAreas()
{
    for(let i = 0; i< HORIZONTAL_AREAS; i++)
    {
        for(let j = 0; j< VERTICAL_AREAS; j++)
        {
            let _mapArea = new mapArea();
            _mapArea.topLeft = {x: i*(C_WIDTH/HORIZONTAL_AREAS), y: j*(C_HEIGHT/VERTICAL_AREAS)};
            _mapArea.bottomRight = {x: (i+1)*(C_WIDTH/HORIZONTAL_AREAS), y: (j+1)*(C_HEIGHT/VERTICAL_AREAS)}

            mapAreas.push(_mapArea);
        }
    }
}

function getAllResourcesOnMapAreas()
{
    for(let i=0; i< mapAreas.length; i++)
    {
        mapAreas[i].getResourcesOnMapArea();
    }
}

function getAllSoldiersOnMapAreas()
{
    for(let i=0; i< mapAreas.length; i++)
    {
        mapAreas[i].getSoldiersOnMapArea();
    }
}

function clearAllSoldiersOnMapAreas()
{
    for(let i=0; i< mapAreas.length; i++)
    {
        mapAreas[i].clearSoldiersOnMapArea();
    }
}

function getAllBasesOnMapArea()
{
    for(let i=0; i< mapAreas.length; i++)
    {
        mapAreas[i].getBasesOnMapArea();
    }
}

function clearAllBasesOnMapArea()
{
    for(let i=0; i< mapAreas.length; i++)
    {
        mapAreas[i].clearBasesOnMapArea();
    }
}

function squadsFindClosestNeutralPoint()
{
    let neutralPointDetected = false;
    for(let i = 0; i<squads.length; i++)
    {
        if(squads[i].findClosestNeutralPoint())
        {
            squads[i].moveToPoint(squads[i].findClosestNeutralPoint());
            neutralPointDetected = true;
        }
        
        
    }
    if(neutralPointDetected == false)
    {
        return null;
    }
    else
    {
        return true;
    }
    
}
function squadsFindClosestEnemyPoint()
{
    let enemyPointDetected = false;
    for(let i = 0; i<squads.length; i++)
    {
        if(squads[i].findClosestEnemyPoint())
        {
            squads[i].moveToPoint(squads[i].findClosestEnemyPoint());
            enemyPointDetected = true;
        }
        
        
    }
    if(enemyPointDetected == false)
    {
        return null;
    }
    else
    {
        return true;
    }
}

function checkAllSquadsCohesion()
{
    for (let i = 0; i < squads.length; i++)
    {
        squads[i].checkSquadCohesion();
    }
}

function checkAllSquadMembersHp()
{
    for(let i=0; i < squads.length; i++)
    {
        squads[i].checkSquadMembersHp();
    }
}

function checkAllSquadsDestruction()
{
    for (let i =squads.length-1; i>=0; i--)
    {
        if(squads[i].squadMembers.length <= 0)
        {
            squads.splice(i, 1);
        }
    }
}

function findBluePlayersAround(soldier, range)
{
    let bluePlayersAround = [];
    
    for(let i =0 ; i < soldiers.length; i++)
    {
        
        if(soldiers[i].player.color == "blue")
        {
            
            let z = Math.hypot (soldiers[i].status.x - soldier.status.x, soldiers[i].status.y - soldier.status.y);
            if(((z <= range) && (z>=0)) || ((z>= range) && (z < 0)))
            {
                
                
                bluePlayersAround.push(soldiers[i]);
            }
        }
    }
    if(bluePlayersAround.length == 0)
    {
        
        return null;
    }
    else
    {
        return bluePlayersAround;
    }
}

function findRedPlayersAround(soldier, range)
{
    let redPlayersAround = [];
    
    for(let i =0 ; i < soldiers.length; i++)
    {
        
        if(soldiers[i].player.color == "red")
        {
            
            let z = Math.hypot (soldiers[i].status.x - soldier.status.x, soldiers[i].status.y - soldier.status.y);
            if(((z <= range) && (z>=0)) || ((z>= range) && (z < 0)))
            {
                
                
                redPlayersAround.push(soldiers[i]);
            }
        }
    }
    if(redPlayersAround.length == 0)
    {
        
        return null;
    }
    else
    {
        return redPlayersAround;
    }
}
    
function checkIfAllRedPointsAreAttackedAndReturnAttackedPointsArray()
{   
    let attackedPoints = [];

    for(let i = 0; i< mapAreas.length; i++)
    {
        if(mapAreas[i].checkIfRedPointIsAttackedAndReturnAttackers() != null)
        {
            attackedPoints.push(mapAreas[i]);
            //mapAreas[i].checkIfRedPointIsAttackedAndReturnAttackers()
        }
    }
    if(attackedPoints.length > 0)
    {
       // console.log(attackedPoints.length);
        return attackedPoints;
        
    }
    else
    {
        return null;
    }
}
function squadCatpureRoutine(squad)
{
    let neutralPointDetected = false;
    let enemyPointDetected = false;
    
        if(squad.findClosestNeutralPoint())
        {
            squad.moveToPoint(squad.findClosestNeutralPoint());
            neutralPointDetected = true;
        }
    
        else if(squads[i].findClosestEnemyPoint())
        {
            squad.moveToPoint(squad.findClosestEnemyPoint());
            enemyPointDetected = true;
        }
            
        if( (neutralPointDetected = false) && (enemyPointDetected == false) )
        {
            return null;
        }
        else
        {
            return true;
        }
    
    
}

function updateAllThreatenedLevel()
{
    for( let i = 0; i < squads.length; i++)
    {
        squads[i].updateThreatenedLevel();
    }
    
}

function getAllSquadsPowerLevels()
{
    for(let i =0; i< squads.length; i++)
    {
        squads[i].getPowerLevel();
    }
}
function updateSquadsArray()
{
    for(let i = squads.length -1; i>=0; i--  )
    {
        if( squads[i].squadMembers.length <= 0 )
        {
            squads.splice(i, 1);
        }
    }
}
function createSquadStrategies()
{
    standardSquadStrategy = new squadStrategy();
    standardSquadStrategy.type = "standard";

    offensiveSquadStrategy = new squadStrategy();
    offensiveSquadStrategy.type = "offensive";
    
    defensiveSquadStrategy = new squadStrategy();
    defensiveSquadStrategy.type = "defensive";
}
function applyAllSquadsStrategies()
{
    for(let i =0; i< squads.length; i++)
    {
        squads[i].applyGlobalStrategy();
    }
}
function AI_init()
{
    createRedAI();
    createMapAreas();
    getAllResourcesOnMapAreas();
    createSquadStrategies();
    createRoutine1();
    createRoutine2();
    createRoutine3();
    createRoutine4();
    
    createSquad(creationRoutine1, standardSquadStrategy);
    
    
    //squad1.executeActionLoop(0);
}
function AI_loop()
{
    
    clearAllSoldiersOnMapAreas();
    getAllSoldiersOnMapAreas();

    clearAllBasesOnMapArea();
    getAllBasesOnMapArea();

    checkAllSquadsCohesion();
    updateSquadsArray();

    updateAllThreatenedLevel();
    applyAllSquadsStrategies();
   /*  if(squadsFindClosestNeutralPoint())
    {
        squadsFindClosestNeutralPoint();
    }
    else if (squadsFindClosestEnemyPoint())
    {
        squadsFindClosestEnemyPoint();
    } */
    

    checkAllSquadMembersHp();
    checkAllSquadsDestruction();
    getAllSquadsPowerLevels();

    redAI.globalSituation.calculateRatios();

    redAI.checkResourcesAndSituationToDetermineIfAndWhatToBuild();

    if(checkIfAllRedPointsAreAttackedAndReturnAttackedPointsArray() != null)
    {
        // check global AI
    }
    //console.log(soldiers[2].status.x, soldiers[2].status.y);
    //console.log(findBluePlayersAround(soldiers[2], 400));
}