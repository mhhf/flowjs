<?php

class Tree
{

    public $children = array();
    public $hasChild = false;
    public $id;

    public function __construct($id){
        $this->{'id'} = $id; 
    }
    public function hasChildren(){
        return $this->{'hasChild'};
    }
    public function addChild($id,$information){
        array_push($this->{'children'},array('id'=>$id,'info'=>$information,'children'=>new Tree($id)));
        $this->{'hasChild'} = true;
    }
    public function getNodeById($id){
        $return = null;


        if($this->{'id'} == $id)
        {
            $return = $this; 
        }else{
            foreach($this->{'children'} as $child)
            {
                if($child['id'] == $id){
                    $return = $child['children'];
                    break;
                }
                else if( count($child['children']->{'children'})>0 ){
                    $return = $child['children']->getNodeById($id);
                    if($return != null) break;
                }
            } 
        }
        return $return;
    }
    public function addToId($targetId,$newId,$information){
        $succes = false;

        $node = $this->getNodeById($targetId);
        if($node != null){
            $node->addChild($newId,$information);
            $succes = true;
        }
        return $succes;
    }
    public function givJson(){
        $first = true;
        $return = "";
        foreach( $this->{'children'} as $child ){
            if($first){$first = false;}else{$return .= ",";}
            $return .= "{\n";
            $return .= $child['info'];
            if($child['children']->hasChildren())
            {
                $return .= ", \"children\":[".($child['children']->givJson())."]";
            }else{
                $return .= ", \"children\":[]" ;
            }
            $return .= "\n}";
        }
        return $return;
    }
}

$tree = new Tree(0);


$link = mysql_connect('localhost', 'root', 'root');
if (!$link) {
        die('Verbindung schlug fehl: ' . mysql_error());
}
mysql_select_db('gogetit', $link); 

$query = "SELECT * FROM Circle WHERE username='denis' ORDER BY parentId;";
$result = mysql_query($query);

mysql_close($link);
//echo $result;

while ($r = mysql_fetch_array($result)) {

    if($r['id'] != $r['parentId'])
    {
        $info = 
            "\"id\":\"".$r['id']."\",
            \"parentId\":\"".$r['parentId']."\",
            \"name\":\"".$r['name']."\",
            \"weight\":\"".$r['weight']."\",
            \"health\":\"".$r['health']."\"";
        $tree->addToId(intval($r['parentId']),intval($r['id']),$info);
    }
} 
echo "{
    \"name\":\"root\",
    \"priority\":\"1\",
    \"health\":\"1\",
    \"children\":[";
echo $tree->givJson();
echo "]}";

?>
